import express from "express";
import { randomUUID } from "node:crypto";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { sayHello, makeReport } from "./inngest/functions.js";
import { reports } from "./reports-store.js";

const app = express();
app.use(express.json());

const PORT = 3000;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Inngest calls this endpoint to discover and run our functions
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: [sayHello, makeReport] })
);

// The fast door: accept the request, hand the slow work to Inngest, return instantly.
app.post("/reports", async (req, res) => {
  const { topic } = req.body ?? {};

  if (!topic) {
    // Bad input gets rejected at the door - no event sent, no job created.
    return res.status(400).json({ error: "topic is required" });
  }

  const id = randomUUID();
  reports.set(id, { id, topic, status: "pending" });

  await inngest.send({ name: "report/requested", data: { id, topic } });

  res.status(202).json({ id, status: "pending" });
});

// The status endpoint: client polls this until status flips to "done".
app.get("/reports/:id", (req, res) => {
  const report = reports.get(req.params.id);

  if (!report) {
    return res.status(404).json({ error: "report not found" });
  }

  res.json(report);
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
