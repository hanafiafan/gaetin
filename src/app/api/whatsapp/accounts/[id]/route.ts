import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { UpdateAccountSchema } from "@/lib/validators/whatsapp";
import { hariPemanasanAwal, profilUmur } from "@/lib/messaging/account-age";
import { effectiveDailyLimit, isWarmingUp } from "@/lib/messaging/warmup";
import { fail } from "@/lib/api";

/** Ubah setelan satu nomor: nama, umur nomor, dan batas kirim hariannya. */
export async function PATCH(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const akun = await prisma.messagingAccount.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
  });
  if (!akun) return fail("NOT_FOUND", "Nomor tidak ditemukan", 404);

  const parsed = UpdateAccountSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const { label, dailyLimit, accountAge } = parsed.data;

  // Hari pemanasan hanya disetel ulang kalau UMURNYA yang berubah. Menghitung
  // ulang di setiap penyimpanan akan mengembalikan nomor yang sudah memanas
  // lima hari ke titik awal cuma karena pemiliknya mengganti namanya.
  const umurBerubah = accountAge !== undefined && accountAge !== akun.accountAge;

  const diperbarui = await prisma.messagingAccount.update({
    where: { id: akun.id },
    data: {
      ...(label !== undefined ? { label } : {}),
      ...(dailyLimit !== undefined ? { dailyLimit } : {}),
      ...(accountAge !== undefined ? { accountAge } : {}),
      ...(umurBerubah ? { warmupDay: hariPemanasanAwal(accountAge) } : {}),
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: diperbarui.id,
      label: diperbarui.label,
      dailyLimit: diperbarui.dailyLimit,
      accountAge: diperbarui.accountAge,
      ageLabel: profilUmur(diperbarui.accountAge).label,
      warmupDay: diperbarui.warmupDay,
      todayLimit: effectiveDailyLimit(diperbarui),
      warmingUp: isWarmingUp(diperbarui),
    },
  });
}

/** Hapus nomor beserta sesinya. */
export async function DELETE(_req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const akun = await prisma.messagingAccount.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true },
  });
  if (!akun) return fail("NOT_FOUND", "Nomor tidak ditemukan", 404);

  await prisma.messagingAccount.delete({ where: { id: akun.id } });
  return NextResponse.json({ success: true });
}
