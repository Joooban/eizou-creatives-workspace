import { useEffect, useState } from "react";
import ClientList from "./components/ClientList";
import ClientForm from "./components/ClientForm";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import TaskCalendar from "./components/TaskCalendar";
import { QuotaView } from "./components/QuotaView";
import { getClients } from "./api/clients";
import { getTasks } from "./api/tasks";
import type { Client } from "./types/client";
import type { Task } from "./types/task";
import TeamMemberList from "./components/TeamMemberList";
import TeamMemberForm from "./components/TeamMemberForm";

type Tab = "dashboard" | "tasks" | "calendar" | "clients" | "team";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "tasks", label: "Tasks" },
  { id: "calendar", label: "Calendar" },
  { id: "clients", label: "Clients" },
  { id: "team", label: "Team" },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const [clientRefreshKey, setClientRefreshKey] = useState(0);
  const [clients, setClients] = useState<Client[]>([]);
  const [teamMemberRefreshKey, setTeamMemberRefreshKey] = useState(0);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  function loadTasks() {
    setTasksLoading(true);
    getTasks()
      .then(setTasks)
      .catch((err) => setTasksError(err.message))
      .finally(() => setTasksLoading(false));
  }

  useEffect(() => {
    getClients().then(setClients).catch(console.error);
  }, [clientRefreshKey]);

  useEffect(() => {
    loadTasks();
  }, []);

  function handleTaskUpdated(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleTaskDeleted(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1 className="wordmark">
          EIZOU <span className="wordmark-accent">Creatives</span>
        </h1>
        <nav className="filmstrip-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        {activeTab === "dashboard" && (
          <section>
            <h2 className="section-title">Quota Dashboard</h2>
            <div className="quota-grid">
              {clients.map((client) => (
                <QuotaView
                  key={client.id}
                  clientId={client.id}
                  clientName={client.name}
                  month={currentMonth}
                  year={currentYear}
                />
              ))}
            </div>
          </section>
        )}

        {activeTab === "tasks" && (
          <section>
            <TaskForm onCreated={loadTasks} />
            <div className="card">
              <h2 className="section-title">Tasks</h2>
              <TaskList
                tasks={tasks}
                loading={tasksLoading}
                error={tasksError}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
              />
            </div>
          </section>
        )}

        {activeTab === "calendar" && (
          <section>
            <div className="card">
              <h2 className="section-title">Task Calendar</h2>
              <TaskCalendar tasks={tasks} />
            </div>
          </section>
        )}

        {activeTab === "clients" && (
          <section>
            <ClientForm onCreated={() => setClientRefreshKey((k) => k + 1)} />
            <ClientList key={clientRefreshKey} />
          </section>
        )}

        {activeTab === "team" && (
          <section>
            <div className="card">
              <h2 className="section-title">Add Team Member</h2>
              <TeamMemberForm onCreated={() => setTeamMemberRefreshKey((k) => k + 1)} />
            </div>
            <div className="card">
              <h2 className="section-title">Team Members</h2>
              <TeamMemberList key={teamMemberRefreshKey} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;