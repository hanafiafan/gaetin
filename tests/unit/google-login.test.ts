import { describe, it, expect } from "vitest";
import { alamatCallback, bacaIdToken, urlPersetujuan } from "@/lib/auth/google";

const CLIENT_ID = "123-abc.apps.googleusercontent.com";

/** Menyusun id_token palsu: tanda tangannya tidak dipakai, isinya yang diperiksa. */
function idTokenPalsu(klaim: Record<string, unknown>): string {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "RS256" })}.${b64(klaim)}.tanda-tangan-palsu`;
}

const klaimSah = {
  iss: "https://accounts.google.com",
  aud: CLIENT_ID,
  sub: "10987654321",
  email: "Orang@Gmail.com",
  email_verified: true,
  name: "Orang Baik",
  exp: Math.floor(Date.now() / 1000) + 600,
};

describe("alamat callback", () => {
  it("tidak menggandakan garis miring", () => {
    expect(alamatCallback("https://a.test/")).toBe("https://a.test/api/auth/google/callback");
    expect(alamatCallback("https://a.test")).toBe("https://a.test/api/auth/google/callback");
  });
});

describe("url persetujuan", () => {
  it("membawa client id, tujuan balik, dan state", () => {
    const url = new URL(urlPersetujuan(CLIENT_ID, "https://a.test/cb", "state-acak"));
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url.searchParams.get("client_id")).toBe(CLIENT_ID);
    expect(url.searchParams.get("redirect_uri")).toBe("https://a.test/cb");
    expect(url.searchParams.get("state")).toBe("state-acak");
    expect(url.searchParams.get("scope")).toContain("email");
  });
});

describe("membaca id_token", () => {
  it("menerima token yang sah dan menormalkan emailnya", () => {
    const profil = bacaIdToken(idTokenPalsu(klaimSah), CLIENT_ID);
    expect(profil).toMatchObject({
      googleId: "10987654321",
      email: "orang@gmail.com", // huruf kecil
      name: "Orang Baik",
      emailTerverifikasi: true,
    });
  });

  it("menolak token untuk aplikasi lain", () => {
    expect(bacaIdToken(idTokenPalsu({ ...klaimSah, aud: "aplikasi-lain" }), CLIENT_ID)).toBeNull();
  });

  it("menolak penerbit yang bukan Google", () => {
    expect(bacaIdToken(idTokenPalsu({ ...klaimSah, iss: "https://jahat.test" }), CLIENT_ID)).toBeNull();
  });

  it("menolak token kedaluwarsa", () => {
    const lewat = { ...klaimSah, exp: Math.floor(Date.now() / 1000) - 10 };
    expect(bacaIdToken(idTokenPalsu(lewat), CLIENT_ID)).toBeNull();
  });

  it("menolak bentuk yang bukan token sama sekali", () => {
    for (const rusak of ["", "bukan-token", "a.b", "a.b.c.d"]) {
      expect(bacaIdToken(rusak, CLIENT_ID)).toBeNull();
    }
  });

  it("menandai email yang belum diverifikasi, tidak diam-diam meloloskannya", () => {
    const profil = bacaIdToken(idTokenPalsu({ ...klaimSah, email_verified: false }), CLIENT_ID);
    expect(profil?.emailTerverifikasi).toBe(false);
  });

  it("memakai bagian depan email kalau Google tidak mengirim nama", () => {
    const profil = bacaIdToken(idTokenPalsu({ ...klaimSah, name: "" }), CLIENT_ID);
    expect(profil?.name).toBe("orang");
  });
});
