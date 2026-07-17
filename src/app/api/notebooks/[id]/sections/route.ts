import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createSectionSchema } from "@/features/sections/schemas";

async function getOwnedNotebook(notebookId: string, userId: string) {
  return prisma.notebook.findFirst({ where: { id: notebookId, userId } });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: notebookId } = await params;
  const notebook = await getOwnedNotebook(notebookId, user.id);
  if (!notebook) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sections = await prisma.section.findMany({
    where: { notebookId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(sections);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: notebookId } = await params;
  const notebook = await getOwnedNotebook(notebookId, user.id);
  if (!notebook) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = createSectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const count = await prisma.section.count({ where: { notebookId } });

  const section = await prisma.section.create({
    data: { title: parsed.data.title, notebookId, order: count },
  });

  return NextResponse.json(section, { status: 201 });
}
