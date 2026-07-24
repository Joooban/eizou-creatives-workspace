import type { TeamMember } from "../types/teamMember";

const API_BASE = "http://localhost:3001/api";

export async function getTeamMembers(): Promise<TeamMember[]> {
  const res = await fetch(`${API_BASE}/team-members`);
  if (!res.ok) throw new Error(`Failed to fetch team members: ${res.status}`);
  return res.json();
}

export async function createTeamMember(data: {
  name: string;
  role: string;
}): Promise<TeamMember> {
  const res = await fetch(`${API_BASE}/team-members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create team member: ${res.status}`);
  return res.json();
}

export async function deleteTeamMember(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/team-members/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete team member: ${res.status}`);
}