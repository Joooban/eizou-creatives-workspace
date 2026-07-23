import type { TeamMember } from "../types/teamMember";

const API_BASE = "http://localhost:3001/api";

export async function getTeamMembers(): Promise<TeamMember[]> {
  const res = await fetch(`${API_BASE}/team-members`);
  if (!res.ok) throw new Error(`Failed to fetch team members: ${res.status}`);
  return res.json();
}