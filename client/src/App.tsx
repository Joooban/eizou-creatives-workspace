import { useState } from "react";
import ClientList from "./components/ClientList";
import ClientForm from "./components/ClientForm";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <h1>EIZOU Creatives Operations Workspace</h1>
      <h2>Add Client</h2>
      <ClientForm onCreated={() => setRefreshKey((k) => k + 1)} />
      <h2>Clients</h2>
      <ClientList key={refreshKey} />
    </div>
  );
}

export default App;