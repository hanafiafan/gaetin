import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";
import { ownsMedia, resolveMediaPath, UploadRejectedError } from "@/lib/media/storage";

const CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
  mp4: "video/mp4",
};

/**
 * Menyajikan lampiran. Berkasnya TIDAK berada di folder publik: setiap
 * permintaan harus punya sesi, dan workspace-nya harus cocok dengan folder
 * tempat berkas itu disimpan. Lampiran percakapan pelanggan tidak boleh bisa
 * dibuka siapa pun yang menebak URL-nya.
 */
export async function GET(_req: NextRequest, { params: paramsPromise }: { params: Promise<{ path: string[] }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const relative = params.path.join("/");
  if (!ownsMedia(session.workspace.id, relative)) return fail("NOT_FOUND", "Berkas tidak ditemukan", 404);

  let absolute: string;
  try {
    absolute = resolveMediaPath(relative);
  } catch (err) {
    if (err instanceof UploadRejectedError) return fail("NOT_FOUND", "Berkas tidak ditemukan", 404);
    throw err;
  }

  const info = await stat(absolute).catch(() => null);
  if (!info?.isFile()) return fail("NOT_FOUND", "Berkas tidak ditemukan", 404);

  const ext = relative.split(".").pop()?.toLowerCase() ?? "";
  const stream = Readable.toWeb(createReadStream(absolute)) as ReadableStream;

  return new NextResponse(stream, {
    headers: {
      "Content-Type": CONTENT_TYPE[ext] ?? "application/octet-stream",
      "Content-Length": String(info.size),
      "Cache-Control": "private, max-age=3600",
      // Berkas milik pengguna tidak pernah dieksekusi sebagai halaman.
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
