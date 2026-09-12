if (!process.env.TEST_DATABASE_URL) {
  console.error("TEST_DATABASE_URL is required; integration tests must use an isolated PostgreSQL database.");
  process.exit(1);
}
const { spawnSync } = require("node:child_process");
const result = spawnSync(process.execPath, [require("node:path").join(require("node:path").dirname(require.resolve("vitest/package.json")), "vitest.mjs"), "run", "tests/integration"], { stdio: "inherit", env: process.env });
process.exit(result.status ?? 1);
