import { useState } from "react";
import { createClient } from "../api/clients";

type ClientFormProps = {
  onCreated: () => void;
};

function ClientForm({ onCreated }: ClientFormProps) {
  const [name, setName] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [contractEnd, setContractEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createClient({ name, contractStart, contractEnd });
      setName("");
      setContractStart("");
      setContractEnd("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Client Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="contractStart">Contract Start</label>
        <input
          id="contractStart"
          type="date"
          value={contractStart}
          onChange={(e) => setContractStart(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="contractEnd">Contract End</label>
        <input
          id="contractEnd"
          type="date"
          value={contractEnd}
          onChange={(e) => setContractEnd(e.target.value)}
          required
        />
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Add Client"}
      </button>
    </form>
  );
}

export default ClientForm;