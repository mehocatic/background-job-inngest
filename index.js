import express from "express";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { sayHello } from "./inngest/functions.js";

const app = express();
app.use(express.json());

const PORT = 3000;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Inngest calls this endpoint to discover and run our functions
app.use("/api/inngest", serve({ client: inngest, functions: [sayHello] }));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
