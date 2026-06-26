import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CreateTaskSchema } from "@/lib/validators/task";
import { fail } from "@/lib/api";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const filter = req.nextUrl.searchParams.get("status") ?? "all";
  const rows = await prisma.task.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { dueDate: "asc" },
    include: { contact: { select: { name: true, phone: true } } },
    take: 500,
  });

  const now = Date.now();
  let data = rows.map((t) => {
    const overdue = t.status !== "COMPLETED" && t.dueDate.getTime() < now;
    return {
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate,
      status: overdue ? "OVERDUE" : t.status,
      contactName: t.contact.name ?? `+${t.contact.phone}`,
    };
  });

  if (filter === "pending") data = data.filter((t) => t.status === "PENDING");
  else if (filter === "completed") data = data.filter((t) => t.status === "COMPLETED");
  else if (filter === "overdue") data = data.filter((t) => t.status === "OVERDUE");

  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const workspaceId = session.workspace.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const contact = await prisma.contact.findFirst({
    where: { id: parsed.data.contactId, workspaceId },
    select: { id: true },
  });
  if (!contact) return fail("NOT_FOUND", "Kontak tidak ditemukan", 404);

  const task = await prisma.task.create({
    data: {
      workspaceId,
      contactId: contact.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      dueDate: new Date(parsed.data.dueDate),
      priority: parsed.data.priority,
      createdById: session.user.id,
    },
  });
  return NextResponse.json({ success: true, data: { id: task.id } }, { status: 201 });
}
