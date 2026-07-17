import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reorderSectionsSchema } from "@/features/sections/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: notebookId } = await params;
  const notebook = await prisma.notebook.findFirst({ where: { id: notebookId, userId: user.id } });
  if (!notebook) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = reorderSectionsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.sections.map(({ id, order }) =>
      prisma.section.update({
        where: { id, notebookId },
        data: { order },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}
