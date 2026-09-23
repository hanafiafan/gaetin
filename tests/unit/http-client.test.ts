import { afterEach, describe, expect, it, vi } from "vitest";
import { requestJson } from "@/lib/http/client";

afterEach(() => vi.unstubAllGlobals());

describe("requestJson", () => {
  it("returns successful API data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { id: 1 } }), { status: 200 })));
    await expect(requestJson("/api/test", undefined, "Gagal")).resolves.toEqual({ id: 1 });
  });

  it("surfaces the API message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, error: { message: "Tidak diizinkan" } }), { status: 403 })));
    await expect(requestJson("/api/test", undefined, "Gagal")).rejects.toThrow("Tidak diizinkan");
  });

  it("handles non-JSON and network failures with useful messages", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("upstream error", { status: 502 })));
    await expect(requestJson("/api/test", undefined, "Layanan gagal")).rejects.toThrow("Layanan gagal");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(requestJson("/api/test", undefined, "Gagal")).rejects.toThrow("Koneksi terputus");
  });
});
