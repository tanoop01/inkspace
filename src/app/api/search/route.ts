import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const RESULTS_PER_TYPE = 5;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length === 0) {
    return NextResponse.json({ notebooks: [], sections: [], pages: [] });
  }

  const [notebooks, sections, pages] = await Promise.all([
    prisma.notebook.findMany({
      where: { userId: user.id, isArchived: false, title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true },
      take: RESULTS_PER_TYPE,
    }),
    prisma.section.findMany({
      where: {
        notebook: { userId: user.id },
        title: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        title: true,
        notebookId: true,
        notebook: { select: { title: true } },
      },
      take: RESULTS_PER_TYPE,
    }),
    prisma.page.findMany({
      where: {
        section: { notebook: { userId: user.id } },
        title: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        title: true,
        sectionId: true,
        section: {
          select: { notebookId: true, notebook: { select: { title: true } } },
        },
      },
      take: RESULTS_PER_TYPE,
    }),
  ]);

  return NextResponse.json({
    notebooks: notebooks.map((n) => ({ id: n.id, title: n.title })),
    sections: sections.map((s) => ({
      id: s.id,
      title: s.title,
      notebookId: s.notebookId,
      notebookTitle: s.notebook.title,
    })),
    pages: pages.map((p) => ({
      id: p.id,
      title: p.title,
      sectionId: p.sectionId,
      notebookId: p.section.notebookId,
      notebookTitle: p.section.notebook.title,
    })),
  });
}
