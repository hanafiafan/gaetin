import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import { verifyNotificationSignature } from "@/lib/midtrans/client";

describe("verifyNotificationSignature", () => {
  const orderId = "SUB-ws1-123";
  const statusCode = "200";
  const grossAmount = "10000.00";
  const serverKey = "SB-Mid-server-test";

  it("menerima signature yang dihitung benar", () => {
    const signature = createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest("hex");
    expect(verifyNotificationSignature(orderId, statusCode, grossAmount, serverKey, signature)).toBe(true);
  });

  it("menolak signature yang salah", () => {
    expect(verifyNotificationSignature(orderId, statusCode, grossAmount, serverKey, "salah")).toBe(false);
  });

  it("menolak kalau server key belum dikonfigurasi", () => {
    const signature = createHash("sha512").update(`${orderId}${statusCode}${grossAmount}`).digest("hex");
    expect(verifyNotificationSignature(orderId, statusCode, grossAmount, "", signature)).toBe(false);
  });
});
