import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createNotebookSchema } from "@/features/notebooks/schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notebooks = await prisma.notebook.findMany({
    where: { userId: user.id, isArchived: false },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(notebooks);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createNotebookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const notebook = await prisma.notebook.create({
    data: { title: parsed.data.title, userId: user.id },
  });

  return NextResponse.json(notebook, { status: 201 });
}
