export type Notebook = {
  id: string;
  title: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchNotebooks(): Promise<Notebook[]> {
  const res = await fetch("/api/notebooks");
  if (!res.ok) throw new Error("Failed to fetch notebooks");
  return res.json();
}

export async function fetchNotebook(id: string): Promise<Notebook> {
  const res = await fetch(`/api/notebooks/${id}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Failed to fetch notebook (${res.status})`);
  }
  return res.json();
}

export async function createNotebook(title: string): Promise<Notebook> {
  const res = await fetch("/api/notebooks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create notebook");
  return res.json();
}

export async function renameNotebook(id: string, title: string): Promise<Notebook> {
  const res = await fetch(`/api/notebooks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to rename notebook");
  return res.json();
}

export async function archiveNotebook(id: string): Promise<Notebook> {
  const res = await fetch(`/api/notebooks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isArchived: true }),
  });
  if (!res.ok) throw new Error("Failed to archive notebook");
  return res.json();
}

export async function deleteNotebook(id: string): Promise<void> {
  const res = await fetch(`/api/notebooks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete notebook");
}
