import { describe, it, expect } from "vitest";
import { haversineKm, generateGrid, zoomForRadius } from "@/lib/geo";

describe("geo", () => {
  it("jarak Jakarta–Bandung masuk akal (~100–180 km)", () => {
    const d = haversineKm(-6.2, 106.8, -6.9, 107.6);
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(180);
  });

  it("radius kecil menghasilkan satu titik", () => {
    expect(generateGrid(-6.2, 106.8, 2).length).toBe(1);
  });

  it("radius besar menghasilkan banyak titik dan dibatasi 60", () => {
    const g = generateGrid(-6.2, 106.8, 20);
    expect(g.length).toBeGreaterThan(1);
    expect(g.length).toBeLessThanOrEqual(60);
  });

  it("semua titik grid berada dalam radius", () => {
    const r = 10;
    for (const p of generateGrid(-6.2, 106.8, r)) {
      expect(haversineKm(-6.2, 106.8, p.lat, p.lng)).toBeLessThanOrEqual(r + 0.001);
    }
  });

  it("zoom mengecil saat radius membesar", () => {
    expect(zoomForRadius(2)).toBeGreaterThan(zoomForRadius(20));
  });
});
