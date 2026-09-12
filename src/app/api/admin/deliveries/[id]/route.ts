import { z } from "zod";
import { getSuperAdminSession } from "@/lib/auth/session";
import { reconcileDelivery } from "@/lib/messaging/reconcile";
import { fail, ok } from "@/lib/api";
const Schema = z.object({ status: z.enum(["SENT", "FAILED"]), note: z.string().min(10).max(500) });
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("INVALID_INPUT", "Konfirmasi hasil provider dan catatan minimal 10 karakter diperlukan", 400);
  try { return ok(await reconcileDelivery((await params).id, parsed.data.status, session.user.id, parsed.data.note)); }
  catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") return fail("NOT_FOUND", "Pengiriman tidak ditemukan", 404);
    if (err instanceof Error && err.message === "NOT_RECONCILABLE") return fail("CONFLICT", "Rekonsiliasi hanya untuk UNKNOWN lebih dari 5 menit atau PENDING lebih dari 24 jam", 409);
    throw err;
  }
}
