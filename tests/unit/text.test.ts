import { describe, it, expect } from "vitest";
import { renderSpintax, applyVariables, renderMessage } from "@/lib/messaging/text";

describe("text", () => {
  it("applyVariables mengganti {{nama}} & {{kota}}", () => {
    expect(applyVariables("Halo {{nama}} di {{kota}}", { nama: "Budi", kota: "Bandung" })).toBe(
      "Halo Budi di Bandung",
    );
  });

  it("applyVariables case-insensitive & variabel kosong jadi string kosong", () => {
    expect(applyVariables("Hai {{Nama}}{{tidakada}}", { nama: "Sri" })).toBe("Hai Sri");
  });

  it("renderSpintax memilih salah satu opsi", () => {
    const out = renderSpintax("{pagi|siang|sore}");
    expect(["pagi", "siang", "sore"]).toContain(out);
  });

  it("renderSpintax membiarkan {nama} tanpa pipe", () => {
    expect(renderSpintax("{nama}")).toBe("{nama}");
  });

  it("renderMessage menggabungkan spintax + variabel", () => {
    const out = renderMessage("{Halo|Hai} {{nama}}", { nama: "Ana" });
    expect(["Halo Ana", "Hai Ana"]).toContain(out);
  });
});
