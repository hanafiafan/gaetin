import { prisma } from "@/lib/db/prisma";

/**
 * Masuk dengan akun Google (alur authorization code milik OAuth 2.0).
 *
 * Tidak memakai pustaka autentikasi pihak ketiga. Yang dibutuhkan hanya dua
 * panggilan HTTP ke Google, dan memasang pustaka yang membawa model sesinya
 * sendiri justru akan bertabrakan dengan sesi JWT yang sudah dipakai sistem
 * ini di semua tempat.
 */

const ENDPOINT_OTORISASI = "https://accounts.google.com/o/oauth2/v2/auth";
const ENDPOINT_TOKEN = "https://oauth2.googleapis.com/token";
const PENERBIT_SAH = ["https://accounts.google.com", "accounts.google.com"];

export const COOKIE_STATE = "hellens_oauth_state";

export interface KredensialGoogle {
  clientId: string;
  clientSecret: string;
}

/** Kredensial disimpan seperti integrasi lain: di Konsol Owner, bukan di env. */
export async function kredensialGoogle(): Promise<KredensialGoogle | null> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: ["google_client_id", "google_client_secret"] } },
  });
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = typeof r.value === "string" ? r.value : String(r.value ?? "");

  const clientId = map.google_client_id?.trim() ?? "";
  const clientSecret = map.google_client_secret?.trim() ?? "";
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export async function googleSiap(): Promise<boolean> {
  return (await kredensialGoogle()) !== null;
}

/** Alamat tujuan Google mengembalikan pengguna. Harus sama persis dengan yang didaftarkan. */
export function alamatCallback(appUrl: string): string {
  return `${appUrl.replace(/\/$/, "")}/api/auth/google/callback`;
}

export function urlPersetujuan(clientId: string, redirectUri: string, state: string): string {
  const q = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    // Meminta layar pemilihan akun, bukan langsung memakai akun terakhir —
    // penting di komputer yang dipakai bergantian.
    prompt: "select_account",
  });
  return `${ENDPOINT_OTORISASI}?${q.toString()}`;
}

export interface ProfilGoogle {
  googleId: string;
  email: string;
  name: string;
  emailTerverifikasi: boolean;
}

/**
 * Membaca isi id_token tanpa memeriksa tanda tangannya.
 *
 * Aman DI SINI, dan hanya di sini: tokennya tidak datang dari browser, tapi
 * dari balasan langsung Google atas permintaan server-ke-server lewat TLS —
 * cara yang memang disebut Google sendiri tidak memerlukan verifikasi ulang.
 * Yang tetap diperiksa: penerbitnya, penerimanya, dan masa berlakunya.
 */
export function bacaIdToken(idToken: string, clientId: string, sekarang = new Date()): ProfilGoogle | null {
  const bagian = idToken.split(".");
  if (bagian.length !== 3) return null;

  let klaim: Record<string, unknown>;
  try {
    klaim = JSON.parse(Buffer.from(bagian[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }

  const iss = String(klaim.iss ?? "");
  const aud = String(klaim.aud ?? "");
  const exp = Number(klaim.exp ?? 0);
  const sub = String(klaim.sub ?? "");
  const email = String(klaim.email ?? "").toLowerCase();

  if (!PENERBIT_SAH.includes(iss)) return null;
  if (aud !== clientId) return null;
  if (!exp || exp * 1000 <= sekarang.getTime()) return null;
  if (!sub || !email) return null;

  // Email yang belum diverifikasi Google tidak boleh dipakai menautkan akun:
  // siapa pun bisa mengaku memiliki email orang lain.
  const emailTerverifikasi = klaim.email_verified === true || klaim.email_verified === "true";

  const nama = String(klaim.name ?? "").trim();
  return {
    googleId: sub,
    email,
    name: nama || email.split("@")[0],
    emailTerverifikasi,
  };
}

/** Menukar kode dari Google dengan id_token. */
export async function tukarKode(
  kode: string,
  kredensial: KredensialGoogle,
  redirectUri: string,
): Promise<{ idToken: string } | { error: string }> {
  const res = await fetch(ENDPOINT_TOKEN, {
    method: "POST",
    signal: AbortSignal.timeout(15_000),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: kode,
      client_id: kredensial.clientId,
      client_secret: kredensial.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  }).catch(() => null);

  if (!res || !res.ok) return { error: `GOOGLE_TOKEN_${res?.status ?? "NETWORK"}` };

  const json = (await res.json().catch(() => null)) as { id_token?: string } | null;
  if (!json?.id_token) return { error: "GOOGLE_NO_ID_TOKEN" };
  return { idToken: json.id_token };
}
