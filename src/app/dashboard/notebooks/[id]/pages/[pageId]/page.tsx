"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePage } from "@/features/pages/use-pages";
import { ExcalidrawCanvas } from "@/features/canvas/excalidraw-canvas";
import { useAutosavePage } from "@/features/pages/use-autosave-page";
import { SaveStatusIndicator } from "@/features/pages/save-status-indicator";
import { sanitizeLoadedAppState } from "@/features/canvas/scene-serialization";
import { useCanvasImages, type FileUrlEntry } from "@/features/canvas/use-canvas-images";
import { loadRemoteFilesForExcalidraw } from "@/features/canvas/load-remote-files";
import { useUser } from "@/features/auth/use-user";
import { Button } from "@/components/ui/button";

type RawCanvas = {
  elements?: unknown[];
  appState?: Record<string, unknown>;
  fileUrls?: Record<string, FileUrlEntry>;
};

type ExcalidrawAPI = {
  getSceneElements: () => readonly unknown[];
  getAppState: () => Record<string, unknown>;
  getFiles: () => Record<string, unknown>;
};

export default function PageDetailPage() {
  const params = useParams<{ id: string; pageId: string }>();
  const router = useRouter();
  const { user } = useUser();
  const { data: page, isLoading } = usePage(params.pageId);
  const isFirstChange = useRef(true);
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawAPI | null>(null);

  const [initialData, setInitialData] = useState<{
    elements?: unknown[];
    appState?: Record<string, unknown>;
    files?: Record<string, unknown>;
  } | null>(null);
  const preparedForPageRef = useRef<string | null>(null);

  const rawCanvas = page?.canvasJson as RawCanvas | undefined;

  const canvasImages = useCanvasImages(user?.id ?? "", params.pageId, rawCanvas?.fileUrls);

  const { status, scheduleSave, flush, saveNow } = useAutosavePage(params.pageId, {
    waitForPendingUploads: canvasImages.waitForPendingUploads,
    getFileUrls: canvasImages.getFileUrls,
    getLiveScene: () => {
      if (!excalidrawApi) return null;
      const elements = excalidrawApi.getSceneElements();
      const appState = excalidrawApi.getAppState();
      const files = excalidrawApi.getFiles();
      canvasImages.handleFilesChange(
        files as Record<string, { id: string; dataURL: string; mimeType: string }>,
      );
      return { elements, appState, files };
    },
  });

  useEffect(() => {
    if (!page || preparedForPageRef.current === params.pageId) return;
    preparedForPageRef.current = params.pageId;

    (async () => {
      const files = await loadRemoteFilesForExcalidraw(rawCanvas?.fileUrls);
      setInitialData({
        elements: rawCanvas?.elements,
        appState: sanitizeLoadedAppState(rawCanvas?.appState),
        files,
      });
    })();
  }, [page, params.pageId, rawCanvas]);

  function handleBack() {
    // No explicit scene passed — flush reads live from Excalidraw itself,
    // which is what guarantees we never miss the very last stroke.
    flush();
    router.push(`/dashboard/notebooks/${params.id}`);
  }

  async function handleManualSave() {
    await saveNow();
  }

  if (isLoading || !initialData) return <main className="p-8">Loading...</main>;
  if (!page) return <main className="p-8">Page not found.</main>;

  return (
    <main className="flex h-screen flex-col">
      <header className="grid shrink-0 grid-cols-3 items-center border-b border-border px-4 py-2">
        <button
          type="button"
          onClick={handleBack}
          className="justify-self-start text-sm text-muted-foreground hover:underline"
        >
          ← Back to notebook
        </button>

        <h1 className="justify-self-center truncate text-sm font-medium">{page.title}</h1>

        <div className="flex items-center justify-self-end gap-3">
          <SaveStatusIndicator status={status} />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleManualSave}
            disabled={status === "saving" || !excalidrawApi}
          >
            Save
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <ExcalidrawCanvas
          initialData={initialData}
          onApiReady={(api) => setExcalidrawApi(api as ExcalidrawAPI)}
          onChange={(elements, appState, files) => {
            if (isFirstChange.current) {
              isFirstChange.current = false;
              return;
            }
            canvasImages.handleFilesChange(
              files as Record<string, { id: string; dataURL: string; mimeType: string }>,
            );
            scheduleSave({
              elements,
              appState: appState as Record<string, unknown>,
              files: files as Record<string, unknown>,
            });
          }}
        />
      </div>
    </main>
  );
}
