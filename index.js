import express from "express";

const app = express();
app.use(express.json());

const PORT = 3000;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
