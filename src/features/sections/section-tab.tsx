"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical, GripVertical } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useDeleteSection, useRenameSection } from "./use-sections";
import type { Section } from "./api";

export function SectionTab({
  section,
  notebookId,
  isActive,
  onSelect,
}: {
  section: Section;
  notebookId: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState(section.title);
  const renameSection = useRenameSection(notebookId);
  const deleteSection = useDeleteSection(notebookId);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || title === section.title) {
      setIsRenaming(false);
      return;
    }
    renameSection.mutate(
      { id: section.id, title: title.trim() },
      { onSuccess: () => setIsRenaming(false) },
    );
  }

  function handleDelete() {
    if (confirm(`Delete "${section.title}"? Its pages will be deleted too.`)) {
      deleteSection.mutate(section.id);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1 rounded-md border px-2 py-1.5 text-sm",
        isActive ? "border-primary bg-primary/5 font-medium" : "border-border",
      )}
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
        <button type="button" onClick={onSelect} className="flex-1 text-left">
          {section.title}
        </button>
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
