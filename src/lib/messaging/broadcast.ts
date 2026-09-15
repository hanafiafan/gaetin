import { prisma } from "@/lib/db/prisma";
import { deliverWhatsApp, DeliveryBlockedError } from "./delivery";
import { renderMessage } from "./text";
import { InsufficientCreditsError } from "@/lib/credits/service";
import { DailyMessagingQuotaError } from "./quota";
import { enqueue } from "@/lib/jobs/queue";
import { alasanBerhenti, dalamJamKirim, jedaPesanMs, jendelaBerikutnya, JEDA_MIN_MS, JENDELA_PERIKSA } from "@/lib/messaging/pacing";
import { nomorUntukPesan, totalSisaJatah } from "@/lib/messaging/rotation";

/**
 * Satu pesan per putaran, lalu job-nya menjadwalkan dirinya sendiri.
 *
 * Dulu satu putaran mengirim sepuluh pesan dengan `sleep` 3-8 detik di
 * antaranya. Itu dua masalah sekaligus: sepuluh pesan dalam satu menit adalah
 * pola mesin yang paling mudah dikenali WhatsApp, dan `sleep` di dalam job
 * menahan worker — yang hanya satu antrean — sehingga kampanye lain dan pesan
 * susulan ikut menunggu. Menjadwalkan ulang lewat `runAt` menyelesaikan
 * keduanya, dan jedanya jadi tahan restart karena tersimpan di database.
 */
export async function runBroadcast(kind: "CAMPAIGN" | "BLAST", id: string) {
  const campaign = kind === "CAMPAIGN";
  const job = campaign ? await prisma.campaign.findUnique({ where: { id } }) : await prisma.blast.findUnique({ where: { id } });
  if (!job || job.status !== (campaign ? "ACTIVE" : "RUNNING")) return;
  const accountId = "accountId" in job ? job.accountId : (job.variables as { accountId?: string } | null)?.accountId;
  const template = "messageTemplate" in job ? job.messageTemplate : job.messageText ?? "";
  const pause = async (alasan?: string) => {
    const sebab = alasan ? { pauseReason: alasan } : {};
    if (campaign) await prisma.campaign.updateMany({ where: { id, status: "ACTIVE" }, data: { status: "PAUSED", ...sebab } });
    else await prisma.blast.updateMany({ where: { id, status: "RUNNING" }, data: { status: "STOPPED", ...sebab } });
  };
  if (!accountId) { await pause("Nomor pengirim belum dipilih."); return; }

  // Mode kirim penuh: seluruh daftar dijalankan sampai habis. Batas harian
  // sudah dilewati di pengiriman; di sini yang dilewati jam kirim dan jeda
  // yang melebar, karena keduanya bisa menunda 500 kontak sampai berhari-hari.
  const penuh = (await prisma.workspace.findUnique({ where: { id: job.workspaceId }, select: { blastFull: true } }))?.blastFull ?? false;

  // Di luar jam kirim: tidur sampai jendela berikutnya, jangan dibatalkan.
  // Pesan jam dua pagi dua kali salah — sinyal robot, dan mengganggu orangnya.
  if (!penuh && !dalamJamKirim()) {
    await prisma.$transaction((tx) => enqueue(tx, kind, id, job.workspaceId, { id }, jendelaBerikutnya()));
    return;
  }

  // Rem otomatis. Lonjakan kegagalan muncul beberapa jam sebelum blokir penuh,
  // jadi berhenti sekarang jauh lebih murah daripada kehilangan nomornya.
  // Pesan diproses urut createdAt menaik, jadi yang paling baru dikerjakan
  // adalah createdAt TERBESAR di antara yang sudah selesai. Tabelnya tidak
  // punya updatedAt, dan sentAt kosong pada yang gagal — justru yang dicari.
  const terbaru = campaign
    ? await prisma.campaignMessage.findMany({ where: { campaignId: id, status: { in: ["SENT", "DELIVERED", "READ", "FAILED"] } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: JENDELA_PERIKSA, select: { status: true } })
    : await prisma.blastMessage.findMany({ where: { blastId: id, status: { in: ["SENT", "DELIVERED", "READ", "FAILED"] } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: JENDELA_PERIKSA, select: { status: true } });
  const berhenti = alasanBerhenti(terbaru);
  if (berhenti) { await pause(berhenti); return; }
  const messages = campaign
    ? await prisma.campaignMessage.findMany({ where: { campaignId: id, status: "PENDING" }, include: { contact: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 1 })
    : await prisma.blastMessage.findMany({ where: { blastId: id, status: "PENDING" }, include: { contact: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 1 });
  for (const m of messages) {
    const state = campaign ? await prisma.campaign.findUnique({ where: { id } }) : await prisma.blast.findUnique({ where: { id } });
    if (state?.status !== (campaign ? "ACTIVE" : "RUNNING")) break;
    let status: "SENT" | "FAILED" = "FAILED";
    let error: string | null = null;
    // Nomor dipilih per pesan, bukan sekali untuk seluruh kampanye: beban
    // dibagi ke semua nomor tersambung menurut sisa jatah masing-masing.
    // Pesan yang pernah dicoba tetap memakai nomor yang sama.
    const pengirim = (await nomorUntukPesan(`${kind}:${m.id}`, job.workspaceId, accountId)) ?? accountId;
    try {
      const delivery = await deliverWhatsApp({ id: `${kind}:${m.id}`, workspaceId: job.workspaceId, accountId: pengirim, contactId: m.contactId,
        text: renderMessage(template, { nama: m.contact.name, name: m.contact.name, kota: m.contact.city, phone: m.contact.phone }) });
      status = delivery.status === "SENT" ? "SENT" : "FAILED";
      error = delivery.status === "UNKNOWN" ? "Status kirim belum pasti; periksa WhatsApp sebelum mengirim ulang." : delivery.error;
    } catch (err) {
      if (err instanceof InsufficientCreditsError || err instanceof DailyMessagingQuotaError) { await pause(err.message); break; }
      if (err instanceof DeliveryBlockedError) {
        if (!err.message.startsWith("Opt-out")) { await pause(err.message); break; }
        error = err.message;
      } else throw err;
    }
    const data = { status, errorReason: error, sentAt: status === "SENT" ? new Date() : null };
    if (campaign) await prisma.campaignMessage.update({ where: { id: m.id }, data });
    else await prisma.blastMessage.update({ where: { id: m.id }, data });
  }
  await prisma.$transaction(async (tx) => {
    const counts = campaign
      ? await tx.campaignMessage.groupBy({ by: ["status"], where: { campaignId: id }, _count: true })
      : await tx.blastMessage.groupBy({ by: ["status"], where: { blastId: id }, _count: true });
    const sentCount = counts.filter((x) => ["SENT", "DELIVERED", "READ"].includes(x.status)).reduce((n, x) => n + x._count, 0);
    const failedCount = counts.find((x) => x.status === "FAILED")?._count ?? 0;
    const pending = counts.find((x) => x.status === "PENDING")?._count ?? 0;
    const current = campaign ? await tx.campaign.findUnique({ where: { id } }) : await tx.blast.findUnique({ where: { id } });
    if (!current) return;
    const active = current.status === (campaign ? "ACTIVE" : "RUNNING");
    const done = active && pending === 0;
    if (campaign) await tx.campaign.update({ where: { id }, data: { sentCount, failedCount, ...(done ? { status: "COMPLETED", completedAt: new Date() } : {}) } });
    else await tx.blast.update({ where: { id }, data: { sentCount, failedCount, ...(done ? { status: "COMPLETED", completedAt: new Date() } : {}) } });
    if (active && pending) {
      // Jeda dihitung dari jatah nomor ini hari ini (sudah memperhitungkan masa
      // pemanasan) dibagi sisa jam kirim, bukan angka tetap. Jatah yang sama,
      // tapi tersebar sepanjang hari kerja alih-alih habis dalam belasan menit.
      // Sisa jatah SELURUH nomor tersambung, bukan satu nomor: jatahnya dibagi
      // oleh rotasi, tapi jam kirimnya tidak bertambah.
      const sisa = await totalSisaJatah(job.workspaceId);
      const jeda = process.env.NODE_ENV === "test" ? 0
        : penuh ? JEDA_MIN_MS
        : jedaPesanMs({ jatahHarian: Math.max(1, sisa), sudahTerkirim: 0 });
      await enqueue(tx, kind, id, job.workspaceId, { id }, new Date(Date.now() + jeda));
    }
  });
}
