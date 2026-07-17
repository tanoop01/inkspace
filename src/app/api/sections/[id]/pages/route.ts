import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createPageSchema } from "@/features/pages/schemas";

async function getOwnedSection(sectionId: string, userId: string) {
  return prisma.section.findFirst({
    where: { id: sectionId, notebook: { userId } },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: sectionId } = await params;
  const section = await getOwnedSection(sectionId, user.id);
  if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pages = await prisma.page.findMany({
    where: { sectionId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(pages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: sectionId } = await params;
  const section = await getOwnedSection(sectionId, user.id);
  if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const parsed = createPageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const count = await prisma.page.count({ where: { sectionId } });

  const page = await prisma.page.create({
    data: { title: parsed.data.title, sectionId, order: count },
  });

  return NextResponse.json(page, { status: 201 });
}
