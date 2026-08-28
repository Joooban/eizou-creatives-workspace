import { useState } from "react";
import { deleteClient } from "../api/clients";
import ClientEditModal from "./ClientEditModal";
import type { Client } from "../types/client";

type ClientListProps = {
  clients: Client[];
  loading: boolean;
  error: string | null;
  onClientUpdated: (client: Client) => void;
  onClientDeleted: (id: number) => void;
};

function ClientList({ clients, loading, error, onClientUpdated, onClientDeleted }: ClientListProps) {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setDeleteError(null);
    try {
      await deleteClient(id);
      onClientDeleted(id);
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
              <th>Color</th>
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
                <td>
                  <span className="color-swatch" style={{ backgroundColor: client.color }} />
                </td>
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
          onUpdated={onClientUpdated}
        />
      )}
    </div>
  );
}

export default ClientList;