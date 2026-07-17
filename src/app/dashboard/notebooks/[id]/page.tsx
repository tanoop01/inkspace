"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useNotebook } from "@/features/notebooks/use-notebooks";
import { SectionList } from "@/features/sections/section-list";
import { PageList } from "@/features/pages/page-list";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function NotebookPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const notebookId = params.id;
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    searchParams.get("section"),
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: notebook, isLoading, isError, error } = useNotebook(notebookId);

  if (isLoading) return <main className="p-8">Loading...</main>;

  if (isError) {
    return (
      <main className="p-8">
        <p className="text-destructive">
          Couldn&apos;t load this notebook: {(error as Error)?.message ?? "Unknown error"}
        </p>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          ← Back to dashboard
        </Link>
      </main>
    );
  }

  if (!notebook) return <main className="p-8">Notebook not found.</main>;

  const sidebarContent = (
    <>
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
        ← All notebooks
      </Link>
      <h1 className="mt-2 mb-4 text-lg font-semibold">{notebook.title}</h1>
      <SectionList
        notebookId={notebookId}
        activeSectionId={activeSectionId}
        onSelectSection={(id) => {
          setActiveSectionId(id);
          setMobileNavOpen(false);
        }}
      />
    </>
  );

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <div className="flex items-center justify-between border-b border-border p-3 md:hidden">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger className="inline-flex items-center gap-2 text-sm font-medium">
            <Menu className="h-4 w-4" />
            {notebook.title}
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-4">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden w-64 shrink-0 border-r border-border p-4 md:block">
        {sidebarContent}
      </aside>

      <section className="flex-1 p-4 sm:p-8">
        {activeSectionId ? (
          <PageList sectionId={activeSectionId} notebookId={notebookId} />
        ) : (
          <p className="text-muted-foreground">Select or create a section to get started.</p>
        )}
      </section>
    </main>
  );
}
