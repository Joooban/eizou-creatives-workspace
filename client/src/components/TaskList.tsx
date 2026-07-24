import React, { useMemo, useState } from "react";
import { updateTask, deleteTask } from "../api/tasks";
import type { Task, TaskStatus, ContentType } from "../types/task";

const STATUS_OPTIONS: TaskStatus[] = [
  "PLANNED",
  "IN_PRODUCTION",
  "INTERNAL_REVIEW",
  "CLIENT_REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
];

const CONTENT_TYPE_OPTIONS: ContentType[] = ["GRAPHIC", "PHOTO", "REEL"];

type TaskListProps = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onTaskUpdated: (updated: Task) => void;
  onTaskDeleted: (id: number) => void;
};

function TaskList({ tasks, loading, error: loadError, onTaskUpdated, onTaskDeleted }: TaskListProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [clientFilter, setClientFilter] = useState<string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [contentTypeFilter, setContentTypeFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const [pendingPublishId, setPendingPublishId] = useState<number | null>(null);
  const [publishLinks, setPublishLinks] = useState<Record<string, string>>({});
  
  async function handleStatusChange(taskId: number, newStatus: TaskStatus) {
    if (newStatus === "PUBLISHED") {
      // Don't save yet — open the inline link prompt first
      setPendingPublishId(taskId);
      setPublishLinks({});
      return;
    }

    setUpdatingId(taskId);
    setUpdateError(null);

    try {
      const updated = await updateTask(taskId, { status: newStatus });
      onTaskUpdated(updated);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  async function confirmPublish(taskId: number) {
    setUpdatingId(taskId);
    setUpdateError(null);

    try {
      const links = Object.entries(publishLinks)
        .filter(([, url]) => url.trim())
        .map(([platform, url]) => ({ platform, url: url.trim() }));

      const updated = await updateTask(taskId, {
        status: "PUBLISHED",
        actualPublishDate: new Date().toISOString(),
        publishedLinks: links,
      });
      onTaskUpdated(updated);
      setPendingPublishId(null);
      setPublishLinks({});
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to publish task");
    } finally {
      setUpdatingId(null);
    }
  }

  function cancelPublish() {
    setPendingPublishId(null);
    setPublishLinks({});
  }

  async function handleDelete(taskId: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setUpdateError(null);
    try {
      await deleteTask(taskId);
      onTaskDeleted(taskId);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to delete task");
    }
  }

  const clientOptions = useMemo(() => {
    const map = new Map<number, string>();
    tasks.forEach((t) => map.set(t.client.id, t.client.name));
    return Array.from(map.entries());
  }, [tasks]);

  const assigneeOptions = useMemo(() => {
    const map = new Map<number, string>();
    tasks.forEach((t) => {
      if (t.assignedTo) map.set(t.assignedTo.id, t.assignedTo.name);
    });
    return Array.from(map.entries());
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (clientFilter !== "ALL" && task.client.id !== Number(clientFilter)) return false;
      if (assigneeFilter === "UNASSIGNED" && task.assignedTo !== null) return false;
      if (
        assigneeFilter !== "ALL" &&
        assigneeFilter !== "UNASSIGNED" &&
        task.assignedTo?.id !== Number(assigneeFilter)
      )
        return false;
      if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
      if (contentTypeFilter !== "ALL" && task.contentType !== contentTypeFilter) return false;
      if (search.trim() && !task.title.toLowerCase().includes(search.trim().toLowerCase()))
        return false;
      return true;
    });
  }, [tasks, clientFilter, assigneeFilter, statusFilter, contentTypeFilter, search]);

  if (loading) return <p>Loading tasks...</p>;
  if (loadError) return <p className="error-text">Error: {loadError}</p>;
  if (tasks.length === 0) return <p className="empty-state">No tasks yet.</p>;

  return (
    <div>
      {updateError && <p className="error-text">{updateError}</p>}

      <div className="filters-row">
        <input
          type="text"
          placeholder="Search title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
          <option value="ALL">All Clients</option>
          {clientOptions.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
          <option value="ALL">All Assignees</option>
          <option value="UNASSIGNED">Unassigned</option>
          {assigneeOptions.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select value={contentTypeFilter} onChange={(e) => setContentTypeFilter(e.target.value)}>
          <option value="ALL">All Types</option>
          {CONTENT_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="empty-state">No tasks match the current filters.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Client</th>
              <th>Assigned To</th>
              <th>Type</th>
              <th>Status</th>
              <th>Deadline</th>
              <th></th>
            </tr>
          </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <React.Fragment key={task.id}>
                  <tr>
                  <td>{task.title}</td>
                  <td>{task.client.name}</td>
                  <td>{task.assignedTo?.name ?? "Unassigned"}</td>
                  <td>{task.contentType}</td>
                  <td>
                    <select
                      className={`status-select s-${task.status.toLowerCase()}`}
                      value={task.status}
                      disabled={updatingId === task.id || pendingPublishId === task.id}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="mono">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id, task.title)}>
                      Delete
                    </button>
                  </td>
                </tr>

                {pendingPublishId === task.id && (
                  <tr>
                    <td colSpan={7}>
                      <div className="publish-prompt-group">
                        {task.platforms.split(",").map((platform) => (
                          <div className="publish-prompt" key={platform}>
                            <label htmlFor={`publish-${task.id}-${platform}`}>{platform} link (optional)</label>
                            <input
                              id={`publish-${task.id}-${platform}`}
                              type="url"
                              placeholder={`https://...`}
                              value={publishLinks[platform] ?? ""}
                              onChange={(e) =>
                                setPublishLinks((prev) => ({ ...prev, [platform]: e.target.value }))
                              }
                            />
                          </div>
                        ))}
                        <div className="publish-prompt-actions">
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={updatingId === task.id}
                            onClick={() => confirmPublish(task.id)}
                          >
                            Confirm
                          </button>
                          <button className="btn btn-sm" onClick={cancelPublish}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TaskList;