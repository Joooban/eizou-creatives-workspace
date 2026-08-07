import { useEffect, useState } from "react";
import { getTeamMembers, deleteTeamMember } from "../api/teamMembers";
import type { TeamMember } from "../types/teamMember";

function TeamMemberList() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    getTeamMembers()
      .then(setMembers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setDeleteError(null);
    try {
      await deleteTeamMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setDeleteError(
        `Could not delete "${name}" — they likely still have tasks assigned. (${(err as Error).message})`
      );
    }
  }

  if (loading) return <p className="empty-state">Loading team members...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;

  return (
    <div className="card">
      {deleteError && <p className="error-text">{deleteError}</p>}

      {members.length === 0 ? (
        <p className="empty-state">No team members yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.role}</td>
                <td>{member.isActive ? "Yes" : "No"}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(member.id, member.name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TeamMemberList;
