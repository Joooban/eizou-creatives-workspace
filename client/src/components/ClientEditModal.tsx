import { useState } from "react";
import Modal from "./Modal";
import { updateClient } from "../api/clients";
import type { Client } from "../types/client";

type ClientEditModalProps = {
  client: Client;
  onClose: () => void;
  onUpdated: (client: Client) => void;
};

function ClientEditModal({ client, onClose, onUpdated }: ClientEditModalProps) {
  const [name, setName] = useState(client.name);
  const [contractStart, setContractStart] = useState(client.contractStart.slice(0, 10));
  const [contractEnd, setContractEnd] = useState(client.contractEnd.slice(0, 10));
  const [driveFolder, setDriveFolder] = useState(client.driveFolder ?? "");
  const [notes, setNotes] = useState(client.notes ?? "");
  const [color, setColor] = useState(client.color);
  const [isActive, setIsActive] = useState(client.isActive);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updated = await updateClient(client.id, {
        name,
        contractStart,
        contractEnd,
        driveFolder: driveFolder || undefined,
        notes: notes || undefined,
        color,
        isActive,
      });
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update client");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Edit Client" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="edit-name">Client Name</label>
            <input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="edit-contractStart">Contract Start</label>
            <input
              id="edit-contractStart"
              type="date"
              value={contractStart}
              onChange={(e) => setContractStart(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="edit-contractEnd">Contract End</label>
            <input
              id="edit-contractEnd"
              type="date"
              value={contractEnd}
              onChange={(e) => setContractEnd(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="edit-driveFolder">Drive Folder Link</label>
          <input
            id="edit-driveFolder"
            type="url"
            value={driveFolder}
            onChange={(e) => setDriveFolder(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="edit-notes">Notes</label>
          <textarea id="edit-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="field" style={{ marginBottom: "1rem" }}>
          <label htmlFor="edit-color">Calendar Color</label>
          <input
            id="edit-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="color-input"
          />
        </div>

        <div className="checkbox-row" style={{ marginBottom: "1rem" }}>
          <label>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="modal-footer">
          <button type="button" className="btn btn-sm" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ClientEditModal;
