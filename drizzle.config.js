import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./database/schema.js",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE,
  },
});
