"use client";

import type { SaveStatus } from "./use-autosave-page";

export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  const label =
    status === "saving" ? "Saving..." : status === "saved" ? "Saved" : "Couldn't save";

  return (
    <span className={status === "error" ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
      {label}
    </span>
  );
}
