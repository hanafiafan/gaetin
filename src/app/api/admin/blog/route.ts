import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSuperAdminSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

function slugify(s: string): string {
  return (
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "post"
  );
}

export async function GET() {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ success: true, data: posts });
}

const Schema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(80).optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export async function POST(req: NextRequest) {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const slug = (parsed.data.slug && slugify(parsed.data.slug)) || `${slugify(parsed.data.title)}-${Math.random().toString(36).slice(2, 6)}`;
  try {
    const post = await prisma.blogPost.create({
      data: {
        title: parsed.data.title,
        slug,
        excerpt: parsed.data.excerpt || null,
        content: parsed.data.content,
        status: parsed.data.status,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      },
    });
    return NextResponse.json({ success: true, data: { id: post.id } }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return fail("DUPLICATE", "Slug sudah dipakai", 409);
    }
    throw e;
  }
}
