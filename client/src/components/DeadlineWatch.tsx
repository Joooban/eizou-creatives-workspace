import { formatDistanceToNow } from "date-fns";
import type { Task } from "../types/task";

const UPCOMING_WINDOW_DAYS = 14;

type DeadlineWatchProps = {
  tasks: Task[];
};

function DeadlineRow({ task, overdue }: { task: Task; overdue: boolean }) {
  const deadline = new Date(task.deadline as string);

  return (
    <li className="deadline-row">
      <span className="deadline-row-dot" style={{ backgroundColor: task.client.color }} />
      <div className="deadline-row-main">
        <span className="deadline-row-title">{task.title}</span>
        <span className="deadline-row-meta">
          {task.client.name} · {task.assignedTo?.name ?? "Unassigned"}
        </span>
      </div>
      <div className="deadline-row-right">
        <span className="deadline-row-date">{deadline.toLocaleDateString()}</span>
        <span className={`deadline-row-relative ${overdue ? "overdue" : ""}`}>
          {formatDistanceToNow(deadline, { addSuffix: true })}
        </span>
      </div>
    </li>
  );
}

export function DeadlineWatch({ tasks }: DeadlineWatchProps) {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const active = tasks.filter((t) => t.status !== "PUBLISHED" && t.deadline !== null);

  const overdue = active
    .filter((t) => new Date(t.deadline as string) < now)
    .sort((a, b) => new Date(a.deadline as string).getTime() - new Date(b.deadline as string).getTime());

  const upcoming = active
    .filter((t) => {
      const deadline = new Date(t.deadline as string);
      return deadline >= now && deadline <= windowEnd;
    })
    .sort((a, b) => new Date(a.deadline as string).getTime() - new Date(b.deadline as string).getTime());

  return (
    <div className="card">
      <h2 className="section-title">Deadline Watch</h2>
      <div className="deadline-watch-grid">
        <div>
          <h3 className="deadline-watch-subtitle overdue">Overdue ({overdue.length})</h3>
          {overdue.length === 0 ? (
            <p className="empty-state">Nothing overdue.</p>
          ) : (
            <ul className="deadline-list">
              {overdue.map((task) => (
                <DeadlineRow key={task.id} task={task} overdue />
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="deadline-watch-subtitle">Next {UPCOMING_WINDOW_DAYS} Days ({upcoming.length})</h3>
          {upcoming.length === 0 ? (
            <p className="empty-state">Nothing coming up.</p>
          ) : (
            <ul className="deadline-list">
              {upcoming.map((task) => (
                <DeadlineRow key={task.id} task={task} overdue={false} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
