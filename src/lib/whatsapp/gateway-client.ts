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
  if (!r.ok) throw new Error(`WA_GATEWAY_ERROR_${r.status}`);
  return r.json();
}

export async function gwGetQr(
  accountId: string,
): Promise<{ status: string; qr: string | null; phone: string | null }> {
  const r = await gw(`/qr/${accountId}`);
  if (!r.ok) throw new Error(`WA_GATEWAY_ERROR_${r.status}`);
  return r.json();
}

export async function gwDisconnect(accountId: string): Promise<void> {
  const r = await gw(`/disconnect/${accountId}`, { method: "POST" });
  if (!r.ok) throw new Error(`WA_GATEWAY_ERROR_${r.status}`);
}

export async function gwSend(accountId: string, phone: string, text: string, idempotencyKey?: string): Promise<import("@/lib/messaging/provider").SendResult> {
  try {
    const r = await gw("/send", { method: "POST", body: JSON.stringify({ accountId, phone, text, idempotencyKey }) });
    const j = await r.json();
    if (typeof j.ok !== "boolean") throw new Error("Invalid gateway response");
    return { ...j, retryable: j.retryable ?? (r.status >= 500 && !j.uncertain) };
  } catch (err) {
    return { ok: false, retryable: true, error: err instanceof Error ? err.message : "GATEWAY_UNAVAILABLE" };
  }
}

export async function gwIsRegistered(accountId: string, phone: string): Promise<boolean> {
  const r = await gw("/is-registered", {
    method: "POST",
    body: JSON.stringify({ accountId, phone }),
  });
  const j = (await r.json()) as { ok: boolean; exists: boolean };
  if (!r.ok || !j.ok || typeof j.exists !== "boolean") throw new Error("WA_VALIDATION_FAILED");
  return j.exists;
}
