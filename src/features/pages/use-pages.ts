"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPage,
  deletePage,
  fetchPage,
  fetchPages,
  renamePage,
  reorderPages,
  type Page,
} from "./api";

function pagesKey(sectionId: string) {
  return ["pages", sectionId];
}

export function usePages(sectionId: string) {
  return useQuery({ queryKey: pagesKey(sectionId), queryFn: () => fetchPages(sectionId) });
}

export function usePage(id: string) {
  return useQuery({
    queryKey: ["page", id],
    queryFn: () => fetchPage(id),
    enabled: !!id,
  });
}

export function useCreatePage(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title?: string) => createPage(sectionId, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pagesKey(sectionId) }),
  });
}

export function useRenamePage(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renamePage(id, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pagesKey(sectionId) }),
  });
}

export function useDeletePage(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pagesKey(sectionId) }),
  });
}

export function useReorderPages(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pages: { id: string; order: number }[]) => reorderPages(sectionId, pages),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: pagesKey(sectionId) });
      const previous = queryClient.getQueryData<Page[]>(pagesKey(sectionId));
      if (previous) {
        const reordered = [...previous].sort((a, b) => {
          const aOrder = newOrder.find((p) => p.id === a.id)?.order ?? a.order;
          const bOrder = newOrder.find((p) => p.id === b.id)?.order ?? b.order;
          return aOrder - bOrder;
        });
        queryClient.setQueryData(pagesKey(sectionId), reordered);
      }
      return { previous };
    },
    onError: (_err, _newOrder, context) => {
      if (context?.previous) queryClient.setQueryData(pagesKey(sectionId), context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: pagesKey(sectionId) }),
  });
}
