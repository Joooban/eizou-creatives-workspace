import { useState } from "react";
import { createTeamMember } from "../api/teamMembers";

type TeamMemberFormProps = {
  onCreated: () => void;
};

function TeamMemberForm({ onCreated }: TeamMemberFormProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createTeamMember({ name, role });
      setName("");
      setRole("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h2 className="section-title">Add Team Member</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="role">Role</label>
            <input
              id="role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : "Add Team Member"}
        </button>
      </form>
    </div>
  );
}

export default TeamMemberForm;