import { useEffect, useState } from "react";
import { getClientQuota, updateClient } from "../api/clients";
import { upsertDeliverablePlan } from "../api/deliverablePlans";
import type { Client } from "../types/client";
import type { ClientQuota, QuotaCategory } from "../types/quota";
import type { Task } from "../types/task";

interface QuotaViewProps {
  client: Client;
  tasks: Task[];
  month: number;
  year: number;
  onClientUpdated: (client: Client) => void;
}

type QuotaFormState = {
  graphicsQuota: string;
  photoQuota: string;
  reelsQuota: string;
  moodboardLink: string;
};

function QuotaRow({ label, data }: { label: string; data: QuotaCategory }) {
  const met = data.quota > 0 && data.completed >= data.quota;
  const pct = data.quota > 0 ? Math.min(100, (data.completed / data.quota) * 100) : 0;

  return (
    <div className="quota-row">
      <div className="quota-row-label">
        <span>{label}</span>
        <span className={`quota-row-count ${met ? "met" : ""}`}>
          {data.completed} of {data.quota}
        </span>
      </div>
      <div className="quota-bar-track">
        <div className={`quota-bar-fill ${met ? "met" : ""}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

type EditorContribution = { name: string; firstHalf: number; secondHalf: number };

// Mirrors the server's quota count: published tasks with an actual publish date in the month.
function editorContributions(tasks: Task[], clientId: number, month: number, year: number) {
  const byEditor = new Map<string, EditorContribution>();
  for (const t of tasks) {
    if (t.clientId !== clientId || t.status !== "PUBLISHED" || !t.actualPublishDate) continue;
    const date = new Date(t.actualPublishDate);
    if (date.getMonth() + 1 !== month || date.getFullYear() !== year) continue;

    const name = t.assignedTo?.name ?? "Unassigned";
    const entry = byEditor.get(name) ?? { name, firstHalf: 0, secondHalf: 0 };
    if (date.getDate() <= 15) entry.firstHalf += t.quantity;
    else entry.secondHalf += t.quantity;
    byEditor.set(name, entry);
  }
  return [...byEditor.values()].sort(
    (a, b) => b.firstHalf + b.secondHalf - (a.firstHalf + a.secondHalf)
  );
}

function EditorBreakdown({ contributions, lastDay }: { contributions: EditorContribution[]; lastDay: number }) {
  return (
    <div className="quota-editors">
      <div className="quota-editors-head">
        <span>Editor</span>
        <span>1–15</span>
        <span>16–{lastDay}</span>
        <span>Total</span>
      </div>
      {contributions.length === 0 ? (
        <p className="quota-editors-empty">Nothing published yet.</p>
      ) : (
        contributions.map((c) => (
          <div className="quota-editors-row" key={c.name}>
            <span>{c.name}</span>
            <span>{c.firstHalf}</span>
            <span>{c.secondHalf}</span>
            <span>{c.firstHalf + c.secondHalf}</span>
          </div>
        ))
      )}
    </div>
  );
}

export function QuotaView({ client, tasks, month, year, onClientUpdated }: QuotaViewProps) {
  const clientId = client.id;
  const [quota, setQuota] = useState<ClientQuota | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<QuotaFormState>({
    graphicsQuota: "0",
    photoQuota: "0",
    reelsQuota: "0",
    moodboardLink: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function loadQuota() {
    setQuota(null);
    setError(null);
    getClientQuota(clientId, month, year)
      .then(setQuota)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    setEditing(false);
    loadQuota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, month, year]);

  const noPlan = error !== null && error.includes("404");
  const loaded = quota !== null || error !== null;

  function startEdit() {
    setForm({
      graphicsQuota: String(quota?.graphics.quota ?? 0),
      photoQuota: String(quota?.photo.quota ?? 0),
      reelsQuota: String(quota?.reels.quota ?? 0),
      moodboardLink: client.moodboardLink ?? "",
    });
    setSaveError(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      await upsertDeliverablePlan(clientId, {
        periodMonth: month,
        periodYear: year,
        graphicsQuota: Number(form.graphicsQuota) || 0,
        photoQuota: Number(form.photoQuota) || 0,
        reelsQuota: Number(form.reelsQuota) || 0,
      });
      const updatedClient = await updateClient(clientId, {
        moodboardLink: form.moodboardLink.trim() || null,
      });
      onClientUpdated(updatedClient);
      loadQuota();
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save quota");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <div className="quota-card-header">
        <h3 className="quota-title" style={{ margin: 0 }}>{client.name}</h3>
        {!editing && loaded && (
          <button className="btn btn-secondary btn-sm" onClick={startEdit}>
            {noPlan ? "Set Quota" : "Edit"}
          </button>
        )}
      </div>

      {!editing && (
        <div className="quota-moodboard">
          <span className="quota-moodboard-label">Moodboard</span>
          {client.moodboardLink ? (
            <a href={client.moodboardLink} target="_blank" rel="noopener noreferrer">
              View board
            </a>
          ) : (
            <span className="empty">Not set</span>
          )}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSave}>
          <div className="quota-edit-form">
            <div className="field">
              <label htmlFor={`graphics-${clientId}`}>Graphics</label>
              <input
                id={`graphics-${clientId}`}
                type="number"
                min={0}
                value={form.graphicsQuota}
                onChange={(e) => setForm((f) => ({ ...f, graphicsQuota: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor={`photo-${clientId}`}>Photo</label>
              <input
                id={`photo-${clientId}`}
                type="number"
                min={0}
                value={form.photoQuota}
                onChange={(e) => setForm((f) => ({ ...f, photoQuota: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor={`reels-${clientId}`}>Reels</label>
              <input
                id={`reels-${clientId}`}
                type="number"
                min={0}
                value={form.reelsQuota}
                onChange={(e) => setForm((f) => ({ ...f, reelsQuota: e.target.value }))}
              />
            </div>
          </div>
          <div className="field" style={{ marginBottom: "1rem" }}>
            <label htmlFor={`moodboard-${clientId}`}>Moodboard Link</label>
            <input
              id={`moodboard-${clientId}`}
              type="url"
              placeholder="https://..."
              value={form.moodboardLink}
              onChange={(e) => setForm((f) => ({ ...f, moodboardLink: e.target.value }))}
            />
          </div>
          {saveError && <p className="error-text">{saveError}</p>}
          <div className="quota-edit-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn btn-sm" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : error ? (
        <p className={noPlan ? "empty-state" : "error-text"}>
          {noPlan ? "No quota plan set for this period." : `Error: ${error}`}
        </p>
      ) : !quota ? (
        <p className="empty-state">Loading quota...</p>
      ) : (
        <>
          <QuotaRow label="Graphics" data={quota.graphics} />
          <QuotaRow label="Photo" data={quota.photo} />
          <QuotaRow label="Reels" data={quota.reels} />
          <EditorBreakdown
            contributions={editorContributions(tasks, clientId, month, year)}
            lastDay={new Date(year, month, 0).getDate()}
          />
        </>
      )}
    </div>
  );
}
