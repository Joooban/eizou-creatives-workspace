import { useEffect, useState } from "react";
import Modal from "./Modal";
import { updateTask } from "../api/tasks";
import { getClients } from "../api/clients";
import { getTeamMembers } from "../api/teamMembers";
import type { Client } from "../types/client";
import type { TeamMember } from "../types/teamMember";
import type { ContentType, Priority, Task } from "../types/task";

const PLATFORM_OPTIONS = ["IG", "FB", "TikTok"];

type TaskDetailProps = {
  task: Task;
  onClose: () => void;
  onUpdated: (task: Task) => void;
};

type FormState = {
  title: string;
  clientId: string;
  assignedToId: string;
  contentType: ContentType;
  quantity: string;
  priority: Priority;
  deadline: string;
  scheduledPublishDate: string;
  platforms: string[];
  workingFileLink: string;
  driveLink: string;
  caption: string;
  instructions: string;
};

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function formToState(task: Task): FormState {
  return {
    title: task.title,
    clientId: String(task.clientId),
    assignedToId: task.assignedToId ? String(task.assignedToId) : "",
    contentType: task.contentType,
    quantity: String(task.quantity),
    priority: task.priority,
    deadline: toDateInputValue(task.deadline),
    scheduledPublishDate: toDateInputValue(task.scheduledPublishDate),
    platforms: task.platforms ? task.platforms.split(",") : [],
    workingFileLink: task.workingFileLink ?? "",
    driveLink: task.driveLink ?? "",
    caption: task.caption ?? "",
    instructions: task.instructions ?? "",
  };
}

function DetailItem({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`detail-item ${full ? "detail-full" : ""}`}>
      <label>{label}</label>
      <div className="detail-value">{children}</div>
    </div>
  );
}

function TaskDetail({ task, onClose, onUpdated }: TaskDetailProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>(() => formToState(task));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClients().then(setClients).catch(() => {});
    getTeamMembers().then(setMembers).catch(() => {});
  }, []);

  function startEdit() {
    setForm(formToState(task));
    setError(null);
    setEditing(true);
  }

  function togglePlatform(platform: string) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(platform)
        ? f.platforms.filter((p) => p !== platform)
        : [...f.platforms, platform],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (form.platforms.length === 0) {
      setError("Select at least one platform");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await updateTask(task.id, {
        title: form.title,
        clientId: Number(form.clientId),
        assignedToId: form.assignedToId ? Number(form.assignedToId) : undefined,
        contentType: form.contentType,
        quantity: Number(form.quantity) || 1,
        priority: form.priority,
        deadline: form.deadline || undefined,
        scheduledPublishDate: form.scheduledPublishDate || undefined,
        platforms: form.platforms.join(","),
        workingFileLink: form.workingFileLink || undefined,
        driveLink: form.driveLink || undefined,
        caption: form.caption || undefined,
        instructions: form.instructions || undefined,
      });
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  }

  const clientName = clients.find((c) => c.id === task.clientId)?.name ?? task.client.name;

  return (
    <Modal title={editing ? "Edit Task" : task.title} onClose={onClose}>
      {editing ? (
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="detail-title">Title</label>
              <input
                id="detail-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="detail-client">Client</label>
              <select
                id="detail-client"
                value={form.clientId}
                onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="detail-assignedTo">Assigned To</label>
              <select
                id="detail-assignedTo"
                value={form.assignedToId}
                onChange={(e) => setForm((f) => ({ ...f, assignedToId: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="detail-contentType">Content Type</label>
              <select
                id="detail-contentType"
                value={form.contentType}
                onChange={(e) => setForm((f) => ({ ...f, contentType: e.target.value as ContentType }))}
              >
                <option value="GRAPHIC">Graphic</option>
                <option value="PHOTO">Photo</option>
                <option value="REEL">Reel</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="detail-quantity">Quantity</label>
              <input
                id="detail-quantity"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="detail-priority">Priority</label>
              <select
                id="detail-priority"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="detail-deadline">Deadline</label>
              <input
                id="detail-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="detail-scheduledPublishDate">Scheduled Publish Date</label>
              <input
                id="detail-scheduledPublishDate"
                type="date"
                value={form.scheduledPublishDate}
                onChange={(e) => setForm((f) => ({ ...f, scheduledPublishDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="detail-workingFileLink">Raw Footage Link</label>
            <input
              id="detail-workingFileLink"
              type="url"
              value={form.workingFileLink}
              onChange={(e) => setForm((f) => ({ ...f, workingFileLink: e.target.value }))}
            />
          </div>

          <div className="field">
            <label htmlFor="detail-driveLink">Output Folder Link</label>
            <input
              id="detail-driveLink"
              type="url"
              value={form.driveLink}
              onChange={(e) => setForm((f) => ({ ...f, driveLink: e.target.value }))}
            />
          </div>

          <div className="field">
            <label htmlFor="detail-caption">Caption</label>
            <textarea
              id="detail-caption"
              rows={3}
              value={form.caption}
              onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
            />
          </div>

          <div className="field">
            <label htmlFor="detail-instructions">Instructions</label>
            <textarea
              id="detail-instructions"
              rows={3}
              value={form.instructions}
              onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
            />
          </div>

          <div className="field" style={{ marginBottom: "1rem" }}>
            <label>Platforms</label>
            <div className="checkbox-row">
              {PLATFORM_OPTIONS.map((platform) => (
                <label key={platform}>
                  <input
                    type="checkbox"
                    checked={form.platforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                  />
                  {platform}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-footer">
            <button type="button" className="btn btn-sm" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="detail-grid">
            <DetailItem label="Client">{clientName}</DetailItem>
            <DetailItem label="Assigned To">{task.assignedTo?.name ?? "Unassigned"}</DetailItem>
            <DetailItem label="Content Type">{task.contentType}</DetailItem>
            <DetailItem label="Quantity">{task.quantity}</DetailItem>
            <DetailItem label="Priority">
              <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                <span className="priority-dot" />
                {task.priority}
              </span>
            </DetailItem>
            <DetailItem label="Status">
              <span className={`status-select s-${task.status.toLowerCase()}`} style={{ display: "inline-block" }}>
                {task.status}
              </span>
            </DetailItem>
            <DetailItem label="Platforms">{task.platforms}</DetailItem>
            <DetailItem label="Review Round">{task.reviewRound}</DetailItem>
            <DetailItem label="Deadline">
              {task.deadline ? new Date(task.deadline).toLocaleDateString() : <span className="empty">—</span>}
            </DetailItem>
            <DetailItem label="Scheduled Publish">
              {task.scheduledPublishDate ? (
                new Date(task.scheduledPublishDate).toLocaleDateString()
              ) : (
                <span className="empty">—</span>
              )}
            </DetailItem>
            <DetailItem label="Actual Publish">
              {task.actualPublishDate ? (
                new Date(task.actualPublishDate).toLocaleDateString()
              ) : (
                <span className="empty">—</span>
              )}
            </DetailItem>
            <DetailItem label="Raw Footage">
              {task.workingFileLink ? (
                <a href={task.workingFileLink} target="_blank" rel="noopener noreferrer">Link</a>
              ) : (
                <span className="empty">—</span>
              )}
            </DetailItem>
            <DetailItem label="Output Folder">
              {task.driveLink ? (
                <a href={task.driveLink} target="_blank" rel="noopener noreferrer">Link</a>
              ) : (
                <span className="empty">—</span>
              )}
            </DetailItem>
            {task.publishedLinks.length > 0 && (
              <DetailItem label="Published Links" full>
                {task.publishedLinks.map((link) => (
                  <div key={link.id}>
                    {link.platform}:{" "}
                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                  </div>
                ))}
              </DetailItem>
            )}
            <DetailItem label="Caption" full>
              {task.caption || <span className="empty">—</span>}
            </DetailItem>
            <DetailItem label="Instructions" full>
              {task.instructions || <span className="empty">—</span>}
            </DetailItem>
          </div>

          <p className="page-subtitle" style={{ marginBottom: "1rem" }}>
            To change status, use the dropdown in the task list.
          </p>

          <div className="modal-footer">
            <button className="btn btn-sm" onClick={onClose}>Close</button>
            <button className="btn btn-primary btn-sm" onClick={startEdit}>Edit</button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default TaskDetail;
