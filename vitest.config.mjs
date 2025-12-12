// @ts-check
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    include: ["test/**/*.test.js"],
    // coverage: { provider: "istanbul", reporter: ["text", "html"] },
    exclude: ["test/exam-tds-2025-09-ga7.test.js"],
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
      },
    },
  },
});
