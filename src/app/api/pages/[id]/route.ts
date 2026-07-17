import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updatePageSchema } from "@/features/pages/schemas";

const MAX_CANVAS_JSON_BYTES = 5_000_000;

async function getOwnedPage(id: string, userId: string) {
  return prisma.page.findFirst({
    where: { id, section: { notebook: { userId } } },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const page = await getOwnedPage(id, user.id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(page);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedPage(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = updatePageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.canvasJson !== undefined) {
    const size = JSON.stringify(parsed.data.canvasJson).length;
    if (size > MAX_CANVAS_JSON_BYTES) {
      return NextResponse.json({ error: "Canvas content too large" }, { status: 413 });
    }
  }

  const page = await prisma.page.update({ where: { id }, data: parsed.data });
  return NextResponse.json(page);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getOwnedPage(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.page.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
