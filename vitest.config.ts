import { defineConfig } from "vitest/config";
import path from "path";

// Unit tests for pure helpers. Kept separate from vite.config.ts so the PWA and
// compression plugins don't run during tests.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
