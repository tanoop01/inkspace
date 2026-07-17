"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSection,
  deleteSection,
  fetchSections,
  renameSection,
  reorderSections,
  type Section,
} from "./api";

function sectionsKey(notebookId: string) {
  return ["sections", notebookId];
}

export function useSections(notebookId: string) {
  return useQuery({
    queryKey: sectionsKey(notebookId),
    queryFn: () => fetchSections(notebookId),
  });
}

export function useCreateSection(notebookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => createSection(notebookId, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sectionsKey(notebookId) }),
  });
}

export function useRenameSection(notebookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameSection(id, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sectionsKey(notebookId) }),
  });
}

export function useDeleteSection(notebookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSection(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sectionsKey(notebookId) }),
  });
}

export function useReorderSections(notebookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sections: { id: string; order: number }[]) =>
      reorderSections(notebookId, sections),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: sectionsKey(notebookId) });
      const previous = queryClient.getQueryData<Section[]>(sectionsKey(notebookId));
      if (previous) {
        const reordered = [...previous].sort((a, b) => {
          const aOrder = newOrder.find((s) => s.id === a.id)?.order ?? a.order;
          const bOrder = newOrder.find((s) => s.id === b.id)?.order ?? b.order;
          return aOrder - bOrder;
        });
        queryClient.setQueryData(sectionsKey(notebookId), reordered);
      }
      return { previous };
    },
    onError: (_err, _newOrder, context) => {
      if (context?.previous) {
        queryClient.setQueryData(sectionsKey(notebookId), context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: sectionsKey(notebookId) }),
  });
}
