import { prisma } from "@/lib/db/prisma";

// Kata kunci opt-out yang menghentikan pengiriman ke sebuah nomor.
const OPT_OUT_KEYWORDS = ["stop", "berhenti", "unsubscribe", "cancel", "henti", "stop promo"];

export async function isOnDnc(workspaceId: string, phone: string): Promise<boolean> {
  const row = await prisma.doNotContact.findUnique({
    where: { workspaceId_phone: { workspaceId, phone } },
  });
  return !!row;
}

export async function addToDnc(workspaceId: string, phone: string, reason = "OPT_OUT"): Promise<void> {
  await prisma.doNotContact.upsert({
    where: { workspaceId_phone: { workspaceId, phone } },
    update: {},
    create: { workspaceId, phone, reason },
  });
}

/** Deteksi pesan masuk yang merupakan permintaan berhenti. */
export function isOptOut(text: string): boolean {
  return OPT_OUT_KEYWORDS.includes(text.trim().toLowerCase());
}
