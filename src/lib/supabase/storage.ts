import { createClient } from "@/lib/supabase/client";

const BUCKET = "canvas-images";

export async function uploadCanvasImage(
  userId: string,
  pageId: string,
  fileId: string,
  blob: Blob,
  mimeType: string,
): Promise<string> {
  const supabase = createClient();
  const ext = mimeType.split("/")[1]?.split("+")[0] ?? "png";
  const path = `${userId}/${pageId}/${fileId}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: mimeType,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
