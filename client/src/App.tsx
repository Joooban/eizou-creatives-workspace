import { useState } from "react";
import ClientList from "./components/ClientList";
import ClientForm from "./components/ClientForm";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";

function App() {
  const [clientRefreshKey, setClientRefreshKey] = useState(0);
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  return (
    <div>
      <h1>EIZOU Creatives Operations Workspace</h1>

      <h2>Add Task</h2>
      <TaskForm onCreated={() => setTaskRefreshKey((k) => k + 1)} />
      <h2>Tasks</h2>
      <TaskList key={taskRefreshKey} />

      <h2>Add Client</h2>
      <ClientForm onCreated={() => setClientRefreshKey((k) => k + 1)} />
      <h2>Clients</h2>
      <ClientList key={clientRefreshKey} />
    </div>
  );
}

export default App;