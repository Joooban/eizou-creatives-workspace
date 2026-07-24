import { useEffect, useState } from "react";
import { getClientQuota } from "../api/clients";
import type { ClientQuota } from "../types/quota";

interface QuotaViewProps {
  clientId: number;
  clientName: string;
  month: number;
  year: number;
}

export function QuotaView({ clientId, clientName, month, year }: QuotaViewProps) {
  const [quota, setQuota] = useState<ClientQuota | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuota(null);
    setError(null);
    getClientQuota(clientId, month, year)
      .then(setQuota)
      .catch((err) => setError(err.message));
  }, [clientId, month, year]);

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!quota) return <p>Loading quota...</p>;

  return (
    <div style={{ border: "1px solid #444", padding: "1rem", marginBottom: "1rem" }}>
      <h3>{clientName} — {month}/{year}</h3>
      <p>Graphics: {quota.graphics.completed} of {quota.graphics.quota}</p>
      <p>Photo: {quota.photo.completed} of {quota.photo.quota}</p>
      <p>Reels: {quota.reels.completed} of {quota.reels.quota}</p>
    </div>
  );
}