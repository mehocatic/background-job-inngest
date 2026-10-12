import { inngest } from "./client.js";

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
