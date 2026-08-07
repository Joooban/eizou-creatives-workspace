import { useEffect, useState } from "react";
import { getClientQuota } from "../api/clients";
import { upsertDeliverablePlan } from "../api/deliverablePlans";
import type { ClientQuota, QuotaCategory } from "../types/quota";

interface QuotaViewProps {
  clientId: number;
  clientName: string;
  month: number;
  year: number;
}

type QuotaFormState = {
  graphicsQuota: string;
  photoQuota: string;
  reelsQuota: string;
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

export function QuotaView({ clientId, clientName, month, year }: QuotaViewProps) {
  const [quota, setQuota] = useState<ClientQuota | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<QuotaFormState>({ graphicsQuota: "0", photoQuota: "0", reelsQuota: "0" });
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

  function startEdit() {
    setForm({
      graphicsQuota: String(quota?.graphics.quota ?? 0),
      photoQuota: String(quota?.photo.quota ?? 0),
      reelsQuota: String(quota?.reels.quota ?? 0),
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
        <h3 className="quota-title" style={{ margin: 0 }}>{clientName}</h3>
        {!editing && (
          <button className="btn btn-secondary btn-sm" onClick={startEdit}>
            {noPlan ? "Set Quota" : "Edit"}
          </button>
        )}
      </div>

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
        </>
      )}
    </div>
  );
}
