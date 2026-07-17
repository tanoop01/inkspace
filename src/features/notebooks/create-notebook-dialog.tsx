"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCreateNotebook } from "./use-notebooks";

export function CreateNotebookDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const createNotebook = useCreateNotebook();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createNotebook.mutate(title.trim(), {
      onSuccess: () => {
        setTitle("");
        setOpen(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants())}>New Notebook</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new notebook</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            autoFocus
            placeholder="Notebook title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <DialogFooter>
            <Button type="submit" disabled={createNotebook.isPending}>
              {createNotebook.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
