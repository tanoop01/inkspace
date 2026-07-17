import { Skeleton } from "@/components/ui/skeleton";

export function NotebookCardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-4">
      <Skeleton className="h-5 w-2/3" />
    </div>
  );
}
