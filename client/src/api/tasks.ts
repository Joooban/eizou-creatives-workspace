import type { Task, ContentType, TaskStatus, Priority, Revision } from "../types/task";
import { API_BASE } from "./config";

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

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  status?: TaskStatus;
  actualPublishDate?: string;
  publishedPostLink?: string;
  publishedLinks?: { platform: string; url: string }[];
};

export async function updateTask(id: number, data: UpdateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to update task: ${res.status}`);
  }
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to delete task: ${res.status}`);
  }
}

export async function addTaskRevision(
  taskId: number,
  data: { notes?: string; fileLink?: string }
): Promise<Revision> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/revisions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to add revision: ${res.status}`);
  }
  return res.json();
}

export async function deleteTaskRevision(taskId: number, revisionId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/revisions/${revisionId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Failed to delete revision: ${res.status}`);
  }
}