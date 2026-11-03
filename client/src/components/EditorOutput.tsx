import { useEffect, useState } from "react";
import { getTeamMembers } from "../api/teamMembers";
import type { TeamMember } from "../types/teamMember";
import type { ContentType, Task } from "../types/task";
import { MONTH_NAMES } from "../utils/dateTime";

interface EditorOutputProps {
  tasks: Task[];
  month: number;
  year: number;
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  GRAPHIC: "Graphics",
  PHOTO: "Photo",
  REEL: "Reels",
};

function publishDate(task: Task) {
  return new Date(task.actualPublishDate ?? task.updatedAt);
}

function publishedInPeriod(task: Task, month: number, year: number) {
  if (task.status !== "PUBLISHED") return false;
  const date = publishDate(task);
  return date.getMonth() + 1 === month && date.getFullYear() === year;
}

function sumQuantity(tasks: Task[]) {
  return tasks.reduce((sum, t) => sum + t.quantity, 0);
}

export function EditorOutput({ tasks, month, year }: EditorOutputProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTeamMembers()
      .then(setMembers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="empty-state">Loading editor output...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;

  const lastDay = new Date(year, month, 0).getDate();

  const activeMembers = members.filter((m) => m.isActive && m.role.trim().toLowerCase() === "editor");
  const publishedTasks = tasks.filter((t) => t.status === "PUBLISHED" && t.assignedToId != null);

  return (
    <div className="card">
      <h2 className="section-title">Editor Output</h2>
      {activeMembers.length === 0 ? (
        <p className="empty-state">No active editors yet.</p>
      ) : (
        <div className="editor-output-grid">
          {activeMembers.map((member) => {
            const memberTasks = publishedTasks.filter((t) => t.assignedToId === member.id);
            const monthTasks = memberTasks.filter((t) => publishedInPeriod(t, month, year));
            const firstHalf = sumQuantity(monthTasks.filter((t) => publishDate(t).getDate() <= 15));

            const monthByType: Record<ContentType, number> = { GRAPHIC: 0, PHOTO: 0, REEL: 0 };
            for (const t of monthTasks) monthByType[t.contentType] += t.quantity;

            const monthTotal = sumQuantity(monthTasks);
            const secondHalf = monthTotal - firstHalf;
            const allTimeTotal = sumQuantity(memberTasks);

            return (
              <div className="editor-output-card" key={member.id}>
                <div className="editor-output-header">
                  <span className="editor-output-name">{member.name}</span>
                  <span className="editor-output-role">{member.role}</span>
                </div>
                <div className="editor-output-count">{monthTotal}</div>
                <div className="editor-output-sub">
                  outputs in {MONTH_NAMES[month - 1]}
                </div>
                <div className="editor-output-halves">
                  <div className="editor-output-half">
                    <span className="editor-output-half-label">1–15</span>
                    <span className="editor-output-half-count">{firstHalf}</span>
                  </div>
                  <div className="editor-output-half">
                    <span className="editor-output-half-label">16–{lastDay}</span>
                    <span className="editor-output-half-count">{secondHalf}</span>
                  </div>
                </div>
                <div className="editor-output-types">
                  {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map(
                    (type) =>
                      monthByType[type] > 0 && (
                        <span className="stat-chip" key={type}>
                          {CONTENT_TYPE_LABELS[type]}: {monthByType[type]}
                        </span>
                      )
                  )}
                </div>
                <div className="editor-output-alltime">{allTimeTotal} all-time</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
