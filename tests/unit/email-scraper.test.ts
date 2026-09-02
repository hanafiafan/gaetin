import { describe, it, expect } from "vitest";
import { extractFirstValidEmail } from "@/lib/enrichment/email-scraper";

describe("extractFirstValidEmail", () => {
  it("menemukan email valid di dalam HTML", () => {
    const html = `<html><body><a href="mailto:info@tokosaya.com">Email kami</a></body></html>`;
    expect(extractFirstValidEmail(html)).toBe("info@tokosaya.com");
  });

  it("melewati domain placeholder/junk (sentry, wixpress, dst)", () => {
    const html = `<script>var s="report@sentry.io";</script><p>hubungi kami di sales@tokosaya.id</p>`;
    expect(extractFirstValidEmail(html)).toBe("sales@tokosaya.id");
  });

  it("mengembalikan null kalau tidak ada email valid sama sekali", () => {
    const html = `<script>var s="noreply@sentry.io";</script><p>tidak ada kontak lain</p>`;
    expect(extractFirstValidEmail(html)).toBeNull();
  });

  it("mengembalikan null untuk HTML tanpa email", () => {
    expect(extractFirstValidEmail("<html><body>Halo dunia</body></html>")).toBeNull();
  });
});
