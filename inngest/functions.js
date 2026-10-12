import { inngest } from "./client.js";
import { reports } from "../reports-store.js";

// Stage 1 warm-up function: proves the client -> dev server -> function wiring works
// before we build anything that actually matters.
export const sayHello = inngest.createFunction(
  { id: "say-hello", triggers: { event: "test/hello" } },
  async ({ step }) => {
    // step.sleep is durable: if the process restarts mid-sleep, Inngest resumes
    // here instead of re-running from the top.
    await step.sleep("wait-a-bit", "5s");
    return "Hello from the background!";
  }
);

// The actual slow work. The endpoint that sends this event already returned
// 202 to the client - everything here happens off the request entirely.
export const makeReport = inngest.createFunction(
  { id: "make-report", retries: 2, triggers: { event: "report/requested" } },
  async ({ event, step }) => {
    const { id, topic } = event.data;

    // Stand-in for a real slow task (AI call, big export, etc.)
    await step.sleep("do-the-slow-work", "8s");

    await step.run("build-report", () => {
      // Idempotency: the same event can be delivered twice (retries, redelivery).
      // Checking the saved status means a re-run can't build the report twice.
      const report = reports.get(id);
      if (report.status === "done") return;

      // topic "fail" exists purely to demo retries - see Stage 3 checkpoint
      if (topic === "fail") {
        throw new Error("The report oven is broken!");
      }

      report.status = "done";
      report.result = `Report on "${topic}": ${topic} is a great subject, 3 key insights found.`;
    });
  }
);

// Nothing triggers this but the clock. Every minute it counts how reports
// are doing - a real version of this would run daily, not every minute.
export const heartbeat = inngest.createFunction(
  { id: "heartbeat", triggers: { cron: "* * * * *" } },
  async ({ step }) => {
    await step.run("log-summary", () => {
      const counts = { pending: 0, done: 0, failed: 0 };
      for (const report of reports.values()) {
        counts[report.status] = (counts[report.status] ?? 0) + 1;
      }
      console.log(
        `[heartbeat] pending: ${counts.pending}, done: ${counts.done}, failed: ${counts.failed}`
      );
    });
  }
);
