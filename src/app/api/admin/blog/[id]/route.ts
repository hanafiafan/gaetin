import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSuperAdminSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

const Schema = z.object({
  title: z.string().min(1).max(200).optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(1).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) return fail("NOT_FOUND", "Artikel tidak ditemukan", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const d = parsed.data;
  const publishedAt =
    d.status === "PUBLISHED" && post.status !== "PUBLISHED" ? new Date() : post.publishedAt;

  await prisma.blogPost.update({
    where: { id: post.id },
    data: { title: d.title, excerpt: d.excerpt, content: d.content, status: d.status, publishedAt },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);
  await prisma.blogPost.delete({ where: { id: params.id } }).catch(() => undefined);
  return NextResponse.json({ success: true });
}
