import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import ClientList from "./components/ClientList";
import ClientForm from "./components/ClientForm";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import { QuotaView } from "./components/QuotaView";
import { EditorOutput } from "./components/EditorOutput";
import { DeadlineWatch } from "./components/DeadlineWatch";
import { getClients } from "./api/clients";
import { getTasks } from "./api/tasks";
import type { Client } from "./types/client";
import type { Task } from "./types/task";
import TeamMemberList from "./components/TeamMemberList";
import TeamMemberForm from "./components/TeamMemberForm";

const TaskCalendar = lazy(() => import("./components/TaskCalendar"));

type Tab = "dashboard" | "tasks" | "done" | "calendar" | "clients" | "team";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "tasks", label: "Tasks" },
  { id: "done", label: "Done" },
  { id: "calendar", label: "Calendar" },
  { id: "clients", label: "Clients" },
  { id: "team", label: "Team" },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);
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
    getClients()
      .then(setClients)
      .catch((err) => setClientsError(err.message))
      .finally(() => setClientsLoading(false));
  }, []);

  useEffect(() => {
    loadTasks();
  }, []);

  function handleTaskUpdated(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleTaskDeleted(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function handleClientCreated(client: Client) {
    setClients((prev) => [...prev, client]);
  }

  function handleClientUpdated(updated: Client) {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleClientDeleted(id: number) {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  const activeTasks = useMemo(() => tasks.filter((t) => t.status !== "PUBLISHED"), [tasks]);

  const doneTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === "PUBLISHED")
      .sort((a, b) => {
        const aDate = a.actualPublishDate ?? a.updatedAt;
        const bDate = b.actualPublishDate ?? b.updatedAt;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
  }, [tasks]);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1 className="wordmark">
          EIZOU <span className="wordmark-accent">Creatives</span>
        </h1>
        <p className="tagline">Production tracker for content, clients, and delivery.</p>
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
            <div className="page-header">
              <h2 className="page-title">Quota Dashboard</h2>
              <p className="page-subtitle">Monthly deliverable progress across every client.</p>
            </div>
            <EditorOutput tasks={tasks} month={currentMonth} year={currentYear} />
            <DeadlineWatch tasks={tasks} />
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
            <div className="page-header">
              <h2 className="page-title">Tasks</h2>
              <p className="page-subtitle">Production status, assignments, and links for every deliverable.</p>
            </div>
            <TaskForm onCreated={loadTasks} />
            <div className="card">
              <h2 className="section-title">Tasks</h2>
              <TaskList
                tasks={activeTasks}
                loading={tasksLoading}
                error={tasksError}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
              />
            </div>
          </section>
        )}

        {activeTab === "done" && (
          <section>
            <div className="page-header">
              <h2 className="page-title">Done</h2>
              <p className="page-subtitle">History of every published deliverable, most recent first.</p>
            </div>
            <div className="card">
              <h2 className="section-title">Done</h2>
              <TaskList
                tasks={doneTasks}
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
            <div className="page-header">
              <h2 className="page-title">Task Calendar</h2>
              <p className="page-subtitle">Deadlines across the month at a glance.</p>
            </div>
            <div className="card">
              <Suspense fallback={<p className="empty-state">Loading calendar...</p>}>
                <TaskCalendar tasks={tasks} />
              </Suspense>
            </div>
          </section>
        )}

        {activeTab === "clients" && (
          <section>
            <div className="page-header">
              <h2 className="page-title">Clients</h2>
              <p className="page-subtitle">Manage client contracts and accounts.</p>
            </div>
            <ClientForm onCreated={handleClientCreated} />
            <ClientList
              clients={clients}
              loading={clientsLoading}
              error={clientsError}
              onClientUpdated={handleClientUpdated}
              onClientDeleted={handleClientDeleted}
            />
          </section>
        )}

        {activeTab === "team" && (
          <section>
            <div className="page-header">
              <h2 className="page-title">Team</h2>
              <p className="page-subtitle">Manage team members and roles.</p>
            </div>
            <TeamMemberForm onCreated={() => setTeamMemberRefreshKey((k) => k + 1)} />
            <TeamMemberList key={teamMemberRefreshKey} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;