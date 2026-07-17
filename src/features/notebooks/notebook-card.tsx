"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useArchiveNotebook, useDeleteNotebook, useRenameNotebook } from "./use-notebooks";
import type { Notebook } from "./api";

export function NotebookCard({ notebook }: { notebook: Notebook }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState(notebook.title);
  const renameNotebook = useRenameNotebook();
  const archiveNotebook = useArchiveNotebook();
  const deleteNotebook = useDeleteNotebook();

  function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || title === notebook.title) {
      setIsRenaming(false);
      return;
    }
    renameNotebook.mutate(
      { id: notebook.id, title: title.trim() },
      { onSuccess: () => setIsRenaming(false) },
    );
  }

  function handleDelete() {
    if (confirm(`Delete "${notebook.title}"? This cannot be undone.`)) {
      deleteNotebook.mutate(notebook.id);
    }
  }

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} className="flex-1">
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleRenameSubmit}
              className="h-8"
            />
          </form>
        ) : (
          <Link href={`/dashboard/notebooks/${notebook.id}`} className="flex-1">
            <CardTitle className="text-base font-medium">{notebook.title}</CardTitle>
          </Link>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 shrink-0")}
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={() => archiveNotebook.mutate(notebook.id)}>
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
    </Card>
  );
}
