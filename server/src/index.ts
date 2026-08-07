import express from "express";
import cors from "cors";

import clientsRouter from "./routes/clients";
import teamMembersRouter from "./routes/teamMembers";
import tasksRouter from "./routes/tasks";



const app = express();
const PORT = process.env.PORT || 3001;

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
app.use(cors(CLIENT_ORIGIN ? { origin: CLIENT_ORIGIN } : undefined));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/clients", clientsRouter);
app.use("/api/team-members", teamMembersRouter);
app.use("/api/tasks", tasksRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});