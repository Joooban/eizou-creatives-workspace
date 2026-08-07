import type { DeliverablePlan } from "../types/deliverablePlan";
import { API_BASE } from "./config";

export type UpsertDeliverablePlanInput = {
  periodMonth: number;
  periodYear: number;
  graphicsQuota: number;
  photoQuota: number;
  reelsQuota: number;
};

export async function upsertDeliverablePlan(
  clientId: number,
  data: UpsertDeliverablePlanInput
): Promise<DeliverablePlan> {
  const res = await fetch(`${API_BASE}/clients/${clientId}/deliverable-plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to save deliverable plan: ${res.status}`);
  }
  return res.json();
}

export async function deleteDeliverablePlan(clientId: number, planId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/clients/${clientId}/deliverable-plans/${planId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to clear deliverable plan: ${res.status}`);
  }
}
