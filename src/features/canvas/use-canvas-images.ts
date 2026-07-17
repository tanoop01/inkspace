"use client";

import { useRef } from "react";
import { uploadCanvasImage } from "@/lib/supabase/storage";

export type FileUrlEntry = { url: string; mimeType: string };
type BinaryFileLike = { id: string; dataURL: string; mimeType: string };

export function useCanvasImages(
  userId: string,
  pageId: string,
  initialFileUrls?: Record<string, FileUrlEntry>,
) {
  const fileUrlsRef = useRef<Record<string, FileUrlEntry>>(initialFileUrls ?? {});
  const pendingUploadsRef = useRef<Map<string, Promise<void>>>(new Map());

  function handleFilesChange(files: Record<string, BinaryFileLike>) {
    if (!userId) return; // auth not ready yet — image just won't persist this tick

    for (const [fileId, file] of Object.entries(files ?? {})) {
      const alreadyKnown = fileUrlsRef.current[fileId];
      const alreadyUploading = pendingUploadsRef.current.has(fileId);
      const isLocalData = file.dataURL?.startsWith("data:");

      if (!alreadyKnown && !alreadyUploading && isLocalData) {
        const uploadPromise = (async () => {
          try {
            const blob = await (await fetch(file.dataURL)).blob();
            const url = await uploadCanvasImage(userId, pageId, fileId, blob, file.mimeType);
            fileUrlsRef.current[fileId] = { url, mimeType: file.mimeType };
          } catch (err) {
            console.error("Image upload failed for", fileId, err);
          } finally {
            pendingUploadsRef.current.delete(fileId);
          }
        })();
        pendingUploadsRef.current.set(fileId, uploadPromise);
      }
    }
  }

  async function waitForPendingUploads() {
    await Promise.all(Array.from(pendingUploadsRef.current.values()));
  }

  function getFileUrls() {
    return fileUrlsRef.current;
  }

  return { handleFilesChange, waitForPendingUploads, getFileUrls };
}
