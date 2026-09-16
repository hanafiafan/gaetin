import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE, IMPERSONATE_COOKIE, WORKSPACE_COOKIE } from "@/lib/auth/constants";
import type { Role } from "@prisma/client";

export interface Session {
  token: string;
  user: { id: string; email: string; name: string };
  role: Role;
  isSuperAdmin: boolean;
  impersonating: boolean;
  workspace: { id: string; name: string; slug: string };
  /** Semua workspace yang boleh dibuka akun ini, untuk pemilih di navigasi. */
  workspaces: { id: string; name: string; slug: string; role: Role }[];
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const invalid = await prisma.invalidatedToken.findUnique({ where: { token } });
  if (invalid) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { memberships: { include: { workspace: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!user || user.sessionVersion !== (payload.version ?? 0)) return null;

  // Lock/ban harus mematikan sesi yang sudah berjalan, bukan hanya menolak login berikutnya.
  if (user.lockedUntil && user.lockedUntil > new Date()) return null;

  // Workspace yang dipilih lewat cookie, kalau akun ini memang anggotanya.
  // Cookie yang menunjuk workspace asing atau yang keanggotaannya sudah
  // dicabut jatuh kembali ke workspace pertama, bukan menolak sesi.
  const pilihan = (await cookies()).get(WORKSPACE_COOKIE)?.value;
  const membership = user.memberships.find((m) => m.workspaceId === pilihan) ?? user.memberships[0];
  if (!membership) return null;

  let workspace = membership.workspace;
  let role: Role = membership.role;
  let impersonating = false;

  // Super-admin dapat impersonate workspace lain (cookie khusus).
  const impersonateId = (await cookies()).get(IMPERSONATE_COOKIE)?.value;
  if (impersonateId && user.isSuperAdmin) {
    const ws = await prisma.workspace.findUnique({ where: { id: impersonateId } });
    if (ws) {
      workspace = ws;
      role = "OWNER";
      impersonating = true;
    }
  }

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name },
    role,
    isSuperAdmin: user.isSuperAdmin,
    impersonating,
    workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
    workspaces: user.memberships.map((m) => ({ id: m.workspace.id, name: m.workspace.name, slug: m.workspace.slug, role: m.role })),
  };
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireSuperAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.isSuperAdmin) redirect("/dashboard");
  return session;
}

export async function getSuperAdminSession(): Promise<Session | null> {
  const session = await getSession();
  return session && session.isSuperAdmin ? session : null;
}
