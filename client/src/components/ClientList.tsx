import { useEffect, useState } from "react";
import { getClients } from "../api/clients";
import type { Client } from "../types/client";

function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClients()
      .then((data) => setClients(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading clients...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (clients.length === 0) return <p>No clients yet.</p>;

  return (
    <table border={1} cellPadding={8}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Contract Start</th>
          <th>Contract End</th>
          <th>Active</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => (
          <tr key={client.id}>
            <td>{client.name}</td>
            <td>{new Date(client.contractStart).toLocaleDateString()}</td>
            <td>{new Date(client.contractEnd).toLocaleDateString()}</td>
            <td>{client.isActive ? "Yes" : "No"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ClientList;