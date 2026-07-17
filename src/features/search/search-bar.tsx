"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearch } from "./use-search";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: results, isFetching } = useSearch(query);

  const showDropdown = isFocused && query.trim().length > 0;
  const hasResults =
    results && (results.notebooks.length + results.sections.length + results.pages.length) > 0;

  function clear() {
    setQuery("");
  }

  function goToNotebook(id: string) {
    setIsFocused(false);
    router.push(`/dashboard/notebooks/${id}`);
  }

  function goToSection(notebookId: string, sectionId: string) {
    setIsFocused(false);
    router.push(`/dashboard/notebooks/${notebookId}?section=${sectionId}`);
  }

  function goToPage(notebookId: string, pageId: string) {
    setIsFocused(false);
    router.push(`/dashboard/notebooks/${notebookId}/pages/${pageId}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder="Search notebooks, sections, pages..."
          className="pl-8 pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover p-2 shadow-md">
          {isFetching && <p className="px-2 py-1.5 text-sm text-muted-foreground">Searching...</p>}

          {!isFetching && !hasResults && (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">No results for &quot;{query}&quot;</p>
          )}

          {!isFetching && results && results.notebooks.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Notebooks</p>
              {results.notebooks.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => goToNotebook(n.id)}
                  className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  {n.title}
                </button>
              ))}
            </div>
          )}

          {!isFetching && results && results.sections.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Sections</p>
              {results.sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToSection(s.notebookId, s.id)}
                  className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  {s.title}
                  <span className="ml-1.5 text-xs text-muted-foreground">in {s.notebookTitle}</span>
                </button>
              ))}
            </div>
          )}

          {!isFetching && results && results.pages.length > 0 && (
            <div>
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Pages</p>
              {results.pages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => goToPage(p.notebookId, p.id)}
                  className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  {p.title}
                  <span className="ml-1.5 text-xs text-muted-foreground">in {p.notebookTitle}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
