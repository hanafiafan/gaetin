import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

export interface JwtPayload {
  sub: string; // userId
  version?: number;
  exp?: number;
}

export function signToken(userId: string, version = 0): string {
  return jwt.sign({ sub: userId, version }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as { sub?: string; version?: number; exp?: number };
    if (!decoded.sub) return null;
    return { sub: decoded.sub, version: decoded.version ?? 0, exp: decoded.exp };
  } catch {
    return null;
  }
}
