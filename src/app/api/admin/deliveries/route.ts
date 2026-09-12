import { getSuperAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/api";
export async function GET() {
  if (!await getSuperAdminSession()) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);
  const [deliveries, jobs] = await Promise.all([
    prisma.outboundDelivery.findMany({ where: { status: { in: ["UNKNOWN", "PENDING"] } }, orderBy: { createdAt: "asc" }, take: 100 }),
    prisma.backgroundJob.findMany({ where: { status: "FAILED" }, orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, kind: true, workspaceId: true, attempts: true, error: true, updatedAt: true } }),
  ]);
  return ok({ deliveries, jobs });
}
