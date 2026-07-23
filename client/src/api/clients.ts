import type { Client } from "../types/client";

const API_BASE = "http://localhost:3001/api";

export async function getClients(): Promise<Client[]> {
  const res = await fetch(`${API_BASE}/clients`);
  if (!res.ok) {
    throw new Error(`Failed to fetch clients: ${res.status}`);
  }
  return res.json();
}

export async function createClient(data: {
  name: string;
  contractStart: string;
  contractEnd: string;
  driveFolder?: string;
  notes?: string;
}): Promise<Client> {
  const res = await fetch(`${API_BASE}/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to create client: ${res.status}`);
  }

  return res.json();
}