"use client";

import { useState } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical, GripVertical, FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useDeletePage, useRenamePage } from "./use-pages";
import type { Page } from "./api";

export function PageListItem({
  page,
  sectionId,
  notebookId,
}: {
  page: Page;
  sectionId: string;
  notebookId: string;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState(page.title);
  const renamePage = useRenamePage(sectionId);
  const deletePage = useDeletePage(sectionId);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || title === page.title) {
      setIsRenaming(false);
      return;
    }
    renamePage.mutate(
      { id: page.id, title: title.trim() },
      { onSuccess: () => setIsRenaming(false) },
    );
  }

  function handleDelete() {
    if (confirm(`Delete "${page.title}"? This cannot be undone.`)) {
      deletePage.mutate(page.id);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

      {isRenaming ? (
        <form onSubmit={handleRenameSubmit} className="flex-1">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRenameSubmit}
            className="h-6 px-1 text-sm"
          />
        </form>
      ) : (
        <Link
          href={`/dashboard/notebooks/${notebookId}/pages/${page.id}`}
          className="flex-1 truncate"
        >
          {page.title}
        </Link>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-6 w-6 shrink-0")}
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsRenaming(true)}>Rename</DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
