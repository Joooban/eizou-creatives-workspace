import type { Task, ContentType, TaskStatus, Priority } from "../types/task";

const API_BASE = "http://localhost:3001/api";

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`);
  return res.json();
}

export type CreateTaskInput = {
  title: string;
  clientId: number;
  assignedToId?: number;
  contentType: ContentType;
  platforms: string;
  quantity?: number;
  status?: TaskStatus;
  priority?: Priority;
  deadline?: string;
  scheduledPublishDate?: string;
  caption?: string;
  instructions?: string;
  workingFileLink?: string;
  driveLink?: string;
};

export async function createTask(data: CreateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to create task: ${res.status}`);
  }
  return res.json();
}