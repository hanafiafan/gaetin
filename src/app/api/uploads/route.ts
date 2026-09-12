import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { saveUpload, UploadRejectedError } from "@/lib/media/storage";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  // Menulis berkas ke disk jauh lebih mahal daripada menulis satu baris tabel,
  // jadi batasnya per workspace, bukan per IP.
  const limit = await rateLimit(`upload:${session.workspace.id}`, 60, 60_000);
  if (!limit.ok) return fail("RATE_LIMIT", "Terlalu banyak unggahan. Coba lagi sebentar.", 429);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) return fail("VAL_001", "Berkas tidak ditemukan", 400);

  try {
    const saved = await saveUpload(session.workspace.id, file);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err) {
    if (err instanceof UploadRejectedError) return fail("VAL_001", err.message, 400);
    console.error("Upload gagal", err);
    return fail("UPLOAD_FAILED", "Berkas gagal disimpan", 500);
  }
}
