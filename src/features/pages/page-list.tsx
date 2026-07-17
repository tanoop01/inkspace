"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { usePages, useReorderPages, useCreatePage } from "./use-pages";
import { PageListItem } from "./page-list-item";

export function PageList({
  sectionId,
  notebookId,
}: {
  sectionId: string;
  notebookId: string;
}) {
  const { data: pages, isLoading } = usePages(sectionId);
  const reorderPages = useReorderPages(sectionId);
  const createPage = useCreatePage(sectionId);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !pages) return;

    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(pages, oldIndex, newIndex);

    reorderPages.mutate(reordered.map((p, index) => ({ id: p.id, order: index })));
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading pages...</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Pages</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => createPage.mutate("Untitled")}
          disabled={createPage.isPending}
        >
          + Page
        </Button>
      </div>

      {pages?.length === 0 && <p className="text-sm text-muted-foreground">No pages yet.</p>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={pages?.map((p) => p.id) ?? []} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {pages?.map((page) => (
              <PageListItem
                key={page.id}
                page={page}
                sectionId={sectionId}
                notebookId={notebookId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
