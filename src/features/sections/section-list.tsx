"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSections, useReorderSections } from "./use-sections";
import { SectionTab } from "./section-tab";
import { CreateSectionDialog } from "./create-section-dialog";

export function SectionList({
  notebookId,
  activeSectionId,
  onSelectSection,
}: {
  notebookId: string;
  activeSectionId: string | null;
  onSelectSection: (id: string) => void;
}) {
  const { data: sections, isLoading } = useSections(notebookId);
  const reorderSections = useReorderSections(notebookId);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !sections) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);

    reorderSections.mutate(reordered.map((s, index) => ({ id: s.id, order: index })));
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading sections...</p>;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Sections</h2>
        <CreateSectionDialog notebookId={notebookId} />
      </div>

      {sections?.length === 0 && (
        <p className="text-sm text-muted-foreground">No sections yet.</p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={sections?.map((s) => s.id) ?? []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {sections?.map((section) => (
              <SectionTab
                key={section.id}
                section={section}
                notebookId={notebookId}
                isActive={section.id === activeSectionId}
                onSelect={() => onSelectSection(section.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
