import { useEffect, useState } from "react";
import { getTasks } from "../api/tasks";
import type { Task } from "../types/task";

function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (tasks.length === 0) return <p>No tasks yet.</p>;

  return (
    <table border={1} cellPadding={8}>
      <thead>
        <tr>
          <th>Title</th>
          <th>Client</th>
          <th>Assigned To</th>
          <th>Type</th>
          <th>Status</th>
          <th>Deadline</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td>{task.title}</td>
            <td>{task.client.name}</td>
            <td>{task.assignedTo?.name ?? "Unassigned"}</td>
            <td>{task.contentType}</td>
            <td>{task.status}</td>
            <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TaskList;