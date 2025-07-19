import type { Config } from "drizzle-kit";

export default {
  dialect: "sqlite",
  schema: "./lib/db/schema.ts",
} satisfies Config; 