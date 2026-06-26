import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE, IMPERSONATE_COOKIE } from "@/lib/auth/constants";
import type { Role } from "@prisma/client";

export interface Session {
  token: string;
  user: { id: string; email: string; name: string };
  role: Role;
  isSuperAdmin: boolean;
  impersonating: boolean;
  workspace: { id: string; name: string; slug: string };
}

export async function getSession(): Promise<Session | null> {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const invalid = await prisma.invalidatedToken.findUnique({ where: { token } });
  if (invalid) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { memberships: { include: { workspace: true }, take: 1 } },
  });
  if (!user) return null;

  const membership = user.memberships[0];
  if (!membership) return null;

  let workspace = membership.workspace;
  let role: Role = membership.role;
  let impersonating = false;

  // Super-admin dapat impersonate workspace lain (cookie khusus).
  const impersonateId = cookies().get(IMPERSONATE_COOKIE)?.value;
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
