import { NextResponse } from "next/server";

// Format respons konsisten dengan design.md (ErrorResponse).

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, string[]>,
) {
  return NextResponse.json(
    { success: false, error: { code, message, details, retryable: status >= 500 } },
    { status },
  );
}
