import { defineConfig } from "vitest/config";
<<<<<<< HEAD
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
=======

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
