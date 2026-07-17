import type { FileUrlEntry } from "./use-canvas-images";

async function urlToDataURL(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function loadRemoteFilesForExcalidraw(
  fileUrls: Record<string, FileUrlEntry> | undefined,
): Promise<Record<string, unknown>> {
  if (!fileUrls) return {};

  const entries = await Promise.all(
    Object.entries(fileUrls).map(async ([fileId, { url, mimeType }]) => {
      try {
        const dataURL = await urlToDataURL(url);
        return [
          fileId,
          { id: fileId, dataURL, mimeType, created: Date.now(), lastRetrieved: Date.now() },
        ] as const;
      } catch (err) {
        console.error("Failed to load canvas image", fileId, err);
        return null;
      }
    }),
  );

  return Object.fromEntries(entries.filter((e): e is NonNullable<typeof e> => e !== null));
}
