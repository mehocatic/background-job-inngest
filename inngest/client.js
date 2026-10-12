import { Inngest } from "inngest";

// id must be stable - Inngest uses it to identify this app in the dashboard
export const inngest = new Inngest({ id: "report-api" });
