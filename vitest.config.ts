import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // src/lib/env.ts memvalidasi environment saat modul di-import, dan vitest
    // tidak memuat .env — tanpa ini setiap test yang menyentuh env gagal collect.
    env: {
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      JWT_SECRET: "test-secret-key-not-used-for-signing",
    },
  },
});
