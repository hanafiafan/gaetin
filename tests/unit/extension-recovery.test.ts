import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it, vi } from "vitest";
const content = readFileSync(new URL("../../extension/content.js", import.meta.url), "utf8");
const start = content.indexOf("(async function processScrapeQueue()");
const script = content.slice(start, content.indexOf("// ── AUTO MODE: Phase 1", start));
async function process(state: Record<string, unknown>, send: ReturnType<typeof vi.fn>) {
  const location = { href: "https://www.google.com/maps/place/Cafe" };
  const remove = vi.fn();
  await runInNewContext(script, {
    window: { location }, storageGet: async () => ({ ...state }),
    storageSet: async (data: object) => Object.assign(state, data), storageRemove: remove,
    createFloatUI: () => {}, floatUI: { style: {} }, updateFloatUI: () => {},
    setFloatStatus: () => {}, waitForContent: async () => {},
    extractCurrentPlace: () => ({ businessName: "Cafe", mapsUrl: location.href }),
    sendToApi: send, sleep: async () => {},
  });
  return { location, remove };
}
const fixture = () => ({ hellensJob: { jobId: "job", token: "token", maxLeads: 10, delaySec: 1 }, hellensQueue: ["https://www.google.com/maps/place/Next"], hellensPhase: "scraping", hellensSaved: 0, hellensChunk: [] });
it("keeps the batch and current page when the API fails", async () => {
  const state = fixture();
  const result = await process(state, vi.fn().mockResolvedValue(false));
  expect(state.hellensChunk).toHaveLength(1);
  expect(state.hellensSaved).toBe(0);
  expect(result.location.href).toContain("/Cafe");
  expect(result.remove).not.toHaveBeenCalled();
});
it("retries the stored batch without extracting the same place twice", async () => {
  const state = fixture();
  await process(state, vi.fn().mockResolvedValue(false));
  const send = vi.fn().mockResolvedValue(true);
  const result = await process(state, send);
  expect(send.mock.calls[0][1]).toHaveLength(1);
  expect(state.hellensSaved).toBe(1);
  expect(state.hellensChunk).toHaveLength(0);
  expect(result.location.href).toContain("/Next");
});
it("keeps completion state when finishing the job fails", async () => {
  const state = { ...fixture(), hellensQueue: [] };
  const result = await process(state, vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false));
  expect(state.hellensSaved).toBe(1);
  expect(state.hellensChunk).toHaveLength(0);
  expect(result.remove).not.toHaveBeenCalled();
});
