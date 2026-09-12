import { describe, it, expect } from "vitest";
import path from "path";
import { MEDIA_ROOT, ownsMedia, resolveMediaPath, safeFilename, UploadRejectedError } from "@/lib/media/storage";

describe("penyimpanan lampiran", () => {
  it("menolak path yang keluar dari folder media", () => {
    for (const jahat of ["../rahasia.env", "ws1/../../etc/passwd", "/etc/passwd", "ws1/../../../"]) {
      expect(() => resolveMediaPath(jahat)).toThrow(UploadRejectedError);
    }
  });

  it("menerima path di dalam folder media", () => {
    const hasil = resolveMediaPath("ws1/abc.pdf");
    expect(hasil).toBe(path.resolve(MEDIA_ROOT, "ws1/abc.pdf"));
  });

  it("membuang folder dan karakter aneh dari nama berkas", () => {
    expect(safeFilename("../../etc/passwd", "pdf")).toBe("passwd");
    expect(safeFilename("laporan bulan/9.pdf", "pdf")).toBe("9.pdf");
    expect(safeFilename("faktur<>:|?.pdf", "pdf")).toBe("faktur_.pdf");
    expect(safeFilename("", "png")).toBe("lampiran.png");
    expect(safeFilename("..", "png")).toBe("lampiran.png");
  });

  it("hanya mengakui berkas di folder workspace sendiri", () => {
    expect(ownsMedia("ws1", "ws1/abc.pdf")).toBe(true);
    expect(ownsMedia("ws1", "ws2/abc.pdf")).toBe(false);
    expect(ownsMedia("ws1", "ws2\\abc.pdf")).toBe(false);
    expect(ownsMedia("ws1", "abc.pdf")).toBe(false);
  });
});
