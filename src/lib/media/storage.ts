import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

/**
 * Penyimpanan lampiran: satu folder di disk yang dipakai bersama app dan
 * gateway.
 *
 * Tidak memakai S3 dan tidak memakai URL publik. Gateway sudah berbagi volume
 * dengan app untuk sesi WhatsApp (`wa_sessions`), jadi pola yang sama dipakai
 * lagi di sini — gateway cukup membaca berkasnya langsung lewat path. URL
 * publik justru berbahaya: lampiran pelanggan tidak boleh bisa ditebak orang
 * luar hanya karena Baileys butuh mengunduhnya.
 */

export const MEDIA_ROOT = process.env.MEDIA_DIR || path.join(process.cwd(), ".media");

/** Jenis berkas yang boleh diunggah, beserta perlakuannya di WhatsApp. */
const ALLOWED: Record<string, { ext: string; kind: "image" | "document" | "video" }> = {
  "image/jpeg": { ext: "jpg", kind: "image" },
  "image/png": { ext: "png", kind: "image" },
  "image/webp": { ext: "webp", kind: "image" },
  "application/pdf": { ext: "pdf", kind: "document" },
  "application/msword": { ext: "doc", kind: "document" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { ext: "docx", kind: "document" },
  "application/vnd.ms-excel": { ext: "xls", kind: "document" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { ext: "xlsx", kind: "document" },
  "video/mp4": { ext: "mp4", kind: "video" },
};

/** 16 MB: batas aman WhatsApp untuk foto dan video di satu pesan. */
export const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;

export class UploadRejectedError extends Error {}

export interface StoredMedia {
  /** Path relatif terhadap MEDIA_ROOT, mis. "ws_123/9f8e....pdf". */
  path: string;
  kind: "image" | "document" | "video";
  /** Nama asli, hanya untuk ditampilkan dan dipakai sebagai nama berkas kiriman. */
  filename: string;
  size: number;
  mimetype: string;
}

/** Buang path dan karakter aneh dari nama berkas kiriman pengguna. */
export function safeFilename(raw: string, fallbackExt: string): string {
  const base = path.basename(raw).replace(/[^\w.\- ]+/g, "_").slice(0, 80).trim();
  return base && base !== "." && base !== ".." ? base : `lampiran.${fallbackExt}`;
}

/**
 * Menolak path yang keluar dari folder media.
 *
 * Nama berkas datang dari database, tapi database diisi dari input pengguna;
 * satu `../../` sudah cukup untuk membaca berkas lain di server. Pemeriksaan
 * dilakukan setelah resolve, bukan dengan mencari "..", karena path bisa
 * disandikan dengan banyak cara.
 */
export function resolveMediaPath(relative: string): string {
  const absolute = path.resolve(MEDIA_ROOT, relative);
  const root = path.resolve(MEDIA_ROOT);
  if (absolute !== root && !absolute.startsWith(root + path.sep)) {
    throw new UploadRejectedError("Path lampiran tidak valid");
  }
  return absolute;
}

export async function saveUpload(workspaceId: string, file: File): Promise<StoredMedia> {
  const allowed = ALLOWED[file.type];
  if (!allowed) {
    throw new UploadRejectedError("Jenis berkas ini belum didukung. Pakai foto, PDF, Word, Excel, atau video MP4.");
  }
  if (file.size <= 0) throw new UploadRejectedError("Berkas kosong");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadRejectedError(`Ukuran berkas maksimal ${Math.floor(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.`);
  }

  // Nama simpan diacak, bukan memakai nama asli: dua orang mengunggah
  // "katalog.pdf" tidak boleh saling menimpa, dan nama asli yang ikut ke disk
  // membawa masalahnya sendiri.
  const stored = `${randomUUID()}.${allowed.ext}`;
  const relative = path.join(workspaceId, stored);
  const absolute = resolveMediaPath(relative);

  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, Buffer.from(await file.arrayBuffer()));

  return {
    path: relative,
    kind: allowed.kind,
    filename: safeFilename(file.name, allowed.ext),
    size: file.size,
    mimetype: file.type,
  };
}

/** Berkas ini milik workspace yang meminta? Foldernya sudah menyimpan jawabannya. */
export function ownsMedia(workspaceId: string, relative: string): boolean {
  const [owner] = relative.split(/[\\/]/);
  return owner === workspaceId;
}
