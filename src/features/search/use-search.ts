"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { search } from "./api";

const DEBOUNCE_MS = 300;

export function useSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => search(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });
}
