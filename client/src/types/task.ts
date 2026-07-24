export type ContentType = "GRAPHIC" | "PHOTO" | "REEL";
export type TaskStatus =
  | "PLANNED"
  | "IN_PRODUCTION"
  | "INTERNAL_REVIEW"
  | "CLIENT_REVIEW"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type PublishedLink = {
  id: number;
  taskId: number;
  platform: string;
  url: string;
};

export type Task = {
  id: number;
  title: string;
  clientId: number;
  client: { id: number; name: string };
  assignedToId: number | null;
  assignedTo: { id: number; name: string } | null;
  contentType: ContentType;
  platforms: string;
  quantity: number;
  status: TaskStatus;
  reviewRound: number;
  priority: Priority;
  deadline: string | null;
  scheduledPublishDate: string | null;
  actualPublishDate: string | null;
  caption: string | null;
  instructions: string | null;
  workingFileLink: string | null;
  driveLink: string | null;
  publishedPostLink: string | null;
  publishedLinks: PublishedLink[];
  createdAt: string;
  updatedAt: string;
};