import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  timestamp: string;
};

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/health")
      .then((res) => res.json())
      .then((data: HealthResponse) => setHealth(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>EIZOU Creatives Operations Workspace</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!error && !health && <p>Loading...</p>}
      {health && (
        <p>
          Backend status: <strong>{health.status}</strong> (as of{" "}
          {health.timestamp})
        </p>
      )}
    </div>
  );
}

export default App;