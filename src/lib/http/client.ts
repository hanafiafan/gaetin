type ApiEnvelope<T> = { success?: boolean; data?: T; error?: { message?: string } };

export class ApiRequestError extends Error {}

export async function requestJson<T>(input: RequestInfo | URL, init: RequestInit | undefined, fallback: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw new ApiRequestError("Koneksi terputus. Periksa internet lalu coba lagi.");
  }

  const payload = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    throw new ApiRequestError(payload?.error?.message ?? fallback);
  }
  return payload.data as T;
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
