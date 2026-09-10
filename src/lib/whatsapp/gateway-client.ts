/**
 * HTTP client untuk WA Gateway server yang berjalan di Railway.
 * Semua panggilan Baileys diarahkan ke server ini.
 */

function baseUrl(): string {
  const url = process.env.WA_GATEWAY_BASE_URL;
  if (!url) throw new Error("WA_GATEWAY_BASE_URL not set");
  return url.replace(/\/$/, "");
}

function token(): string {
  return process.env.WA_GATEWAY_TOKEN ?? "";
}

// fetch tanpa timeout menunggu selamanya. Loop blast memanggil ini sekali per
// penerima secara berurutan, jadi satu gateway yang menggantung membekukan
// seluruh kampanye tanpa batas waktu, bukan sekadar memperlambatnya.
const GATEWAY_TIMEOUT_MS = 20_000;

async function gw(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${baseUrl()}${path}`, {
    ...init,
    signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export async function gwConnect(accountId: string): Promise<{ ok: boolean; status: string }> {
  const r = await gw(`/connect/${accountId}`, { method: "POST" });
  return r.json();
}

export async function gwGetQr(
  accountId: string,
): Promise<{ status: string; qr: string | null; phone: string | null }> {
  const r = await gw(`/qr/${accountId}`);
  return r.json();
}

export async function gwDisconnect(accountId: string): Promise<void> {
  await gw(`/disconnect/${accountId}`, { method: "POST" });
}

export async function gwSend(
  accountId: string,
  phone: string,
  text: string,
): Promise<string | undefined> {
  const r = await gw("/send", {
    method: "POST",
    body: JSON.stringify({ accountId, phone, text }),
  });
  const j = (await r.json()) as { ok: boolean; waMessageId?: string; error?: string };
  if (!j.ok) throw new Error(j.error ?? "WA_GATEWAY_ERROR");
  return j.waMessageId;
}

export async function gwIsRegistered(accountId: string, phone: string): Promise<boolean> {
  const r = await gw("/is-registered", {
    method: "POST",
    body: JSON.stringify({ accountId, phone }),
  });
  const j = (await r.json()) as { ok: boolean; exists: boolean };
  return j.exists;
}
