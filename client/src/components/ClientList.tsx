import { useEffect, useState } from "react";
import { getClients, deleteClient } from "../api/clients";
import ClientEditModal from "./ClientEditModal";
import type { Client } from "../types/client";

function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    getClients()
      .then((data) => setClients(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setDeleteError(null);
    try {
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setDeleteError(
        `Could not delete "${name}" — it likely still has tasks or a deliverable plan attached. (${(err as Error).message})`
      );
    }
  }

  if (loading) return <p className="empty-state">Loading clients...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;

  return (
    <div className="card">
      {deleteError && <p className="error-text">{deleteError}</p>}

      {clients.length === 0 ? (
        <p className="empty-state">No clients yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contract Start</th>
              <th>Contract End</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td className="mono">{new Date(client.contractStart).toLocaleDateString()}</td>
                <td className="mono">{new Date(client.contractEnd).toLocaleDateString()}</td>
                <td>{client.isActive ? "Yes" : "No"}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingClient(client)}
                    style={{ marginRight: "0.4rem" }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(client.id, client.name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingClient && (
        <ClientEditModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onUpdated={(updated) => {
            setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          }}
        />
      )}
    </div>
  );
}

export default ClientList;