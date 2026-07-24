import { useEffect, useState } from "react";
import { createTask } from "../api/tasks";
import { getClients } from "../api/clients";
import { getTeamMembers } from "../api/teamMembers";
import type { Client } from "../types/client";
import type { TeamMember } from "../types/teamMember";
import type { ContentType, Priority } from "../types/task";

type TaskFormProps = {
  onCreated: () => void;
};

function TaskForm({ onCreated }: TaskFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [contentType, setContentType] = useState<ContentType>("GRAPHIC");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [deadline, setDeadline] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClients().then(setClients).catch(() => setError("Failed to load clients"));
    getTeamMembers().then(setMembers).catch(() => setError("Failed to load team members"));
  }, []);

  function togglePlatform(platform: string) {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (platforms.length === 0) {
      setError("Select at least one platform");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createTask({
        title,
        clientId: Number(clientId),
        assignedToId: assignedToId ? Number(assignedToId) : undefined,
        contentType,
        platforms: platforms.join(","),
        priority,
        deadline: deadline || undefined,
      });
      setTitle("");
      setClientId("");
      setAssignedToId("");
      setContentType("GRAPHIC");
      setPlatforms([]);
      setPriority("MEDIUM");
      setDeadline("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h2 className="section-title">Add Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="client">Client</label>
            <select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
              <option value="">-- Select a client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="assignedTo">Assigned To</label>
            <select id="assignedTo" value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="contentType">Content Type</label>
            <select
              id="contentType"
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
            >
              <option value="GRAPHIC">Graphic</option>
              <option value="PHOTO">Photo</option>
              <option value="REEL">Reel</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="priority">Priority</label>
            <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="deadline">Deadline</label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="field" style={{ marginBottom: "1rem" }}>
          <label>Platforms</label>
          <div className="checkbox-row">
            {["IG", "FB", "TikTok"].map((platform) => (
              <label key={platform}>
                <input
                  type="checkbox"
                  checked={platforms.includes(platform)}
                  onChange={() => togglePlatform(platform)}
                />
                {platform}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : "Add Task"}
        </button>
      </form>
    </div>
  );
}

export default TaskForm;