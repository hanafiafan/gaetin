import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    fileParallelism: !process.env.TEST_DATABASE_URL,
    testTimeout: 15000,
    include: ["tests/**/*.test.ts"],
    exclude: process.env.TEST_DATABASE_URL ? [] : ["tests/integration/**"],
    // src/lib/env.ts memvalidasi environment saat modul di-import, dan vitest
    // tidak memuat .env — tanpa ini setiap test yang menyentuh env gagal collect.
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "postgresql://test:test@localhost:5432/test",
      JWT_SECRET: "test-secret-key-not-used-for-signing",
    },
  },
});
