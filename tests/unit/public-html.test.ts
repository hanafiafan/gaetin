import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "node:events";
const mocks = vi.hoisted(() => ({ lookup: vi.fn(), request: vi.fn() }));
vi.mock("node:dns/promises", () => ({ lookup: mocks.lookup }));
vi.mock("node:http", () => ({ request: mocks.request }));
vi.mock("node:https", () => ({ request: mocks.request }));
import { fetchPublicHtml, isPublicAddress } from "@/lib/enrichment/public-html";

describe("public website fetch", () => {
  it.each(["127.0.0.1", "10.0.0.1", "169.254.169.254", "172.16.1.1", "192.168.0.1", "100.64.0.1", "::1", "::ffff:127.0.0.1", "fd00::1", "fe80::1", "2002:7f00:1::"])("blocks private or tunneled address %s", (ip) => {
    expect(isPublicAddress(ip)).toBe(false);
  });
  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])("accepts global address %s", (ip) => {
    expect(isPublicAddress(ip)).toBe(true);
  });
  it("blocks mixed DNS answers before connecting", async () => {
    mocks.request.mockClear();
    mocks.lookup.mockResolvedValue([{ address: "8.8.8.8", family: 4 }, { address: "127.0.0.1", family: 4 }]);
    expect(await fetchPublicHtml("https://business.test")).toBeNull();
    expect(mocks.request).not.toHaveBeenCalled();
  });
  it("pins DNS, bounds streamed data and destroys the response", async () => {
    mocks.lookup.mockResolvedValue([{ address: "8.8.8.8", family: 4 }]);
    const response = Object.assign(new EventEmitter(), { statusCode: 200, headers: { "content-type": "text/html" }, destroy: vi.fn() });
    mocks.request.mockImplementation((_url, options) => {
      options.lookup("business.test", {}, (error: unknown, address: string) => { expect(error).toBeNull(); expect(address).toBe("8.8.8.8"); });
      const req = Object.assign(new EventEmitter(), { destroy: vi.fn(), end: () => queueMicrotask(() => {
        req.emit("response", response);
        response.emit("data", Buffer.from("abcdefghijk"));
      }) });
      return req;
    });
    expect(await fetchPublicHtml("https://business.test", 1000, 5)).toBe("abcde");
    expect(response.destroy).toHaveBeenCalledOnce();
  });
  it("blocks redirects into private networks", async () => {
    mocks.request.mockClear();
    mocks.lookup.mockResolvedValue([{ address: "8.8.8.8", family: 4 }]);
    mocks.request.mockImplementation(() => {
      const req = Object.assign(new EventEmitter(), { destroy: vi.fn(), end: () => queueMicrotask(() => req.emit("response", Object.assign(new EventEmitter(), { statusCode: 302, headers: { location: "http://169.254.169.254/latest/meta-data" }, destroy: vi.fn() }))) });
      return req;
    });
    expect(await fetchPublicHtml("https://business.test")).toBeNull();
    expect(mocks.request).toHaveBeenCalledOnce();
  });
});
