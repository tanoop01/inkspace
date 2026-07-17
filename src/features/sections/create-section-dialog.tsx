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
import { useCreateSection } from "./use-sections";

export function CreateSectionDialog({ notebookId }: { notebookId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const createSection = useCreateSection(notebookId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createSection.mutate(title.trim(), {
      onSuccess: () => {
        setTitle("");
        setOpen(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        + Section
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New section</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            autoFocus
            placeholder="Section title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <DialogFooter>
            <Button type="submit" disabled={createSection.isPending}>
              {createSection.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
