import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

export interface JwtPayload {
  sub: string; // userId
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub?: string };
    if (!decoded.sub) return null;
    return { sub: decoded.sub };
  } catch {
    return null;
  }
}
