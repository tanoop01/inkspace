export type Page = {
  id: string;
  sectionId: string;
  title: string;
  editorType: "EXCALIDRAW";
  canvasJson: unknown;
  thumbnailUrl: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export async function fetchPages(sectionId: string): Promise<Page[]> {
  const res = await fetch(`/api/sections/${sectionId}/pages`);
  if (!res.ok) throw new Error("Failed to fetch pages");
  return res.json();
}

export async function fetchPage(id: string): Promise<Page> {
  const res = await fetch(`/api/pages/${id}`);
  if (!res.ok) throw new Error("Failed to fetch page");
  return res.json();
}

export async function createPage(sectionId: string, title = "Untitled"): Promise<Page> {
  const res = await fetch(`/api/sections/${sectionId}/pages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create page");
  return res.json();
}

export async function renamePage(id: string, title: string): Promise<Page> {
  const res = await fetch(`/api/pages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to rename page");
  return res.json();
}

export async function deletePage(id: string): Promise<void> {
  const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete page");
}

export async function reorderPages(
  sectionId: string,
  pages: { id: string; order: number }[],
): Promise<void> {
  const res = await fetch(`/api/sections/${sectionId}/pages/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pages }),
  });
  if (!res.ok) throw new Error("Failed to reorder pages");
}
