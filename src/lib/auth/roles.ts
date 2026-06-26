import type { Role } from "@prisma/client";
import type { Session } from "@/lib/auth/session";

/** Cek apakah role sesi termasuk salah satu role yang diizinkan. */
export function hasRole(session: Session, roles: Role[]): boolean {
  return roles.includes(session.role);
}

export function isManager(session: Session): boolean {
  return hasRole(session, ["OWNER", "ADMIN"]);
}
