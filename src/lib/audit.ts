import { prisma } from "@/lib/db/prisma";

/** Catat aktivitas penting ke audit log (best-effort, tidak melempar error). */
export async function logAudit(
  workspaceId: string,
  userId: string | null,
  action: string,
  target?: string,
): Promise<void> {
  await prisma.auditLog
    .create({ data: { workspaceId, userId, action, target: target ?? null } })
    .catch(() => undefined);
}
