import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reorderPagesSchema } from "@/features/pages/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: sectionId } = await params;
  const section = await prisma.section.findFirst({
    where: { id: sectionId, notebook: { userId: user.id } },
  });
  if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = reorderPagesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.pages.map(({ id, order }) =>
      prisma.page.update({ where: { id, sectionId }, data: { order } }),
    ),
  );

  return NextResponse.json({ success: true });
}
