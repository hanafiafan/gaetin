import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { dayStart, nextDayStart } from "@/lib/messaging/quota";
import { needsFollowUp } from "@/lib/followup/service";

describe("expired session navigation", () => {
  it("lets an invalid-cookie user reach login instead of looping to dashboard", () => {
    const request = new NextRequest("http://localhost/login", { headers: { cookie: `${AUTH_COOKIE}=expired` } });
    expect(middleware(request).headers.get("location")).toBeNull();
  });
  it("redirects a visitor without a cookie to login", () => {
    const request = new NextRequest("http://localhost/dashboard");
    expect(middleware(request).headers.get("location")).toContain("/login");
  });
});
it("uses Jakarta midnight regardless of process timezone", () => {
  const now = new Date("2026-09-12T18:00:00Z");
  expect(dayStart(now).toISOString()).toBe("2026-09-12T17:00:00.000Z");
  expect(nextDayStart(now).toISOString()).toBe("2026-09-13T17:00:00.000Z");
});
it("requires an unanswered outbound message, not inactivity alone", () => {
  const now = new Date("2026-09-12T00:00:00Z");
  const outbound = new Date("2026-09-01T00:00:00Z");
  expect(needsFollowUp(null, null, 3, now)).toBe(false);
  expect(needsFollowUp(outbound, new Date("2026-09-02"), 3, now)).toBe(false);
  expect(needsFollowUp(outbound, new Date("2026-08-31"), 3, now)).toBe(true);
});
