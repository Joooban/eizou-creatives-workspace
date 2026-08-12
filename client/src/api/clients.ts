import type { Client } from "../types/client";
import { API_BASE } from "./config";

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
  color?: string;
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

export async function getClientQuota(clientId: number, month: number, year: number) {
  const res = await fetch(
    `${API_BASE}/clients/${clientId}/quota?month=${month}&year=${year}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch quota: ${res.status}`);
  }

  return res.json();
}

export async function updateClient(
  id: number,
  data: {
    name?: string;
    contractStart?: string;
    contractEnd?: string;
    driveFolder?: string;
    notes?: string;
    color?: string;
    isActive?: boolean;
  }
): Promise<Client> {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to update client: ${res.status}`);
  }

  return res.json();
}

export async function deleteClient(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/clients/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Failed to delete client: ${res.status}`);
  }
}