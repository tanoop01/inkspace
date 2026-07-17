export type SearchResults = {
  notebooks: { id: string; title: string }[];
  sections: { id: string; title: string; notebookId: string; notebookTitle: string }[];
  pages: {
    id: string;
    title: string;
    sectionId: string;
    notebookId: string;
    notebookTitle: string;
  }[];
};

export async function search(query: string): Promise<SearchResults> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}
