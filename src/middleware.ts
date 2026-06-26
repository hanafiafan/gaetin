import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/constants";

function splitEnv(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeHost(value: string) {
  return value
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0]
    .toLowerCase();
}

function normalizePath(value?: string) {
  if (!value) return "";
  const path = value.startsWith("/") ? value : `/${value}`;
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function isSafeLocalPath(value: string | null) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

function adminUrlFor(req: NextRequest, pathname: string) {
  const primaryUrl = process.env.ADMIN_PRIMARY_URL;
  if (!primaryUrl) return null;

  const url = new URL(primaryUrl);
  url.pathname = pathname;
  url.search = req.nextUrl.search;
  return url;
}

// Proteksi route ringan berbasis keberadaan cookie (verifikasi penuh ada di server component).
export function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const { pathname } = req.nextUrl;
  const host = normalizeHost(req.headers.get("host") ?? "");
  const primaryAdminHost = process.env.ADMIN_PRIMARY_URL ? normalizeHost(process.env.ADMIN_PRIMARY_URL) : "";
  const adminHosts = Array.from(new Set([...splitEnv(process.env.ADMIN_HOSTS).map(normalizeHost), primaryAdminHost].filter(Boolean)));
  const adminEntryPath = normalizePath(process.env.ADMIN_ENTRY_PATH);
  const isAdminHost = adminHosts.length > 0 && adminHosts.includes(host);
  const hasDedicatedAdminHost = adminHosts.length > 0 || Boolean(process.env.ADMIN_PRIMARY_URL);
  const isAdminEntry =
    Boolean(adminEntryPath) && (pathname === adminEntryPath || pathname.startsWith(`${adminEntryPath}/`));
  const effectivePathname = isAdminEntry ? `/admin${pathname.slice(adminEntryPath.length)}` : pathname;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtected = effectivePathname.startsWith("/dashboard") || effectivePathname.startsWith("/admin");

  if (isAdminHost && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (hasDedicatedAdminHost && effectivePathname.startsWith("/admin") && !isAdminHost && !isAdminEntry) {
    const adminUrl = adminUrlFor(req, effectivePathname);
    return NextResponse.redirect(adminUrl ?? new URL("/", req.url));
  }

  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }
  if (isAuthPage && token) {
    const next = req.nextUrl.searchParams.get("next");
    const target = isSafeLocalPath(next) ? next! : isAdminHost ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }
  if (isAdminEntry) {
    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = effectivePathname;
    return NextResponse.rewrite(rewriteUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|media|.*\\..*).*)"],
};
