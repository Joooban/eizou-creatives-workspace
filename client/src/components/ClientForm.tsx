import { useState } from "react";
import { createClient } from "../api/clients";
import type { Client } from "../types/client";

type ClientFormProps = {
  onCreated: (client: Client) => void;
};

function ClientForm({ onCreated }: ClientFormProps) {
  const [name, setName] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [color, setColor] = useState("#8B8B90");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const client = await createClient({ name, contractStart, contractEnd, color });
      setName("");
      setContractStart("");
      setContractEnd("");
      setColor("#8B8B90");
      onCreated(client);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h2 className="section-title">Add Client</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Client Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="contractStart">Contract Start</label>
            <input
              id="contractStart"
              type="date"
              value={contractStart}
              onChange={(e) => setContractStart(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="contractEnd">Contract End</label>
            <input
              id="contractEnd"
              type="date"
              value={contractEnd}
              onChange={(e) => setContractEnd(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="color">Calendar Color</label>
            <input
              id="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="color-input"
            />
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : "Add Client"}
        </button>
      </form>
    </div>
  );
}

export default ClientForm;