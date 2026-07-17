export type Section = {
  id: string;
  notebookId: string;
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export async function fetchSections(notebookId: string): Promise<Section[]> {
  const res = await fetch(`/api/notebooks/${notebookId}/sections`);
  if (!res.ok) throw new Error("Failed to fetch sections");
  return res.json();
}

export async function createSection(notebookId: string, title: string): Promise<Section> {
  const res = await fetch(`/api/notebooks/${notebookId}/sections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create section");
  return res.json();
}

export async function renameSection(id: string, title: string): Promise<Section> {
  const res = await fetch(`/api/sections/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to rename section");
  return res.json();
}

export async function deleteSection(id: string): Promise<void> {
  const res = await fetch(`/api/sections/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete section");
}

export async function reorderSections(
  notebookId: string,
  sections: { id: string; order: number }[],
): Promise<void> {
  const res = await fetch(`/api/notebooks/${notebookId}/sections/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sections }),
  });
  if (!res.ok) throw new Error("Failed to reorder sections");
}
