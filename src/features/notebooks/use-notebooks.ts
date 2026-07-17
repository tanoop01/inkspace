"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveNotebook,
  createNotebook,
  deleteNotebook,
  fetchNotebook,
  fetchNotebooks,
  renameNotebook,
} from "./api";

const NOTEBOOKS_KEY = ["notebooks"];

export function useNotebooks() {
  return useQuery({ queryKey: NOTEBOOKS_KEY, queryFn: fetchNotebooks });
}

export function useNotebook(id: string) {
  return useQuery({ queryKey: ["notebooks", id], queryFn: () => fetchNotebook(id) });
}

export function useCreateNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => createNotebook(title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTEBOOKS_KEY }),
  });
}

export function useRenameNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameNotebook(id, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTEBOOKS_KEY }),
  });
}

export function useArchiveNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveNotebook(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTEBOOKS_KEY }),
  });
}

export function useDeleteNotebook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotebook(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTEBOOKS_KEY }),
  });
}
