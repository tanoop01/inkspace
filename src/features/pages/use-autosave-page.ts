"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pickPersistableAppState } from "@/features/canvas/scene-serialization";
import type { FileUrlEntry } from "@/features/canvas/use-canvas-images";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 2000;
const FETCH_TIMEOUT_MS = 10000;

type Scene = {
  elements: readonly unknown[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
};

type AutosaveOptions = {
  waitForPendingUploads?: () => Promise<void>;
  getFileUrls?: () => Record<string, FileUrlEntry>;
  // Reads the true current scene directly from Excalidraw's imperative API.
  // Used whenever we trigger an immediate save without an explicit scene —
  // avoids depending on onChange having already fired for the very latest
  // edit, which is what caused freehand strokes drawn right before
  // navigating away to sometimes get lost.
  getLiveScene?: () => Scene | null;
};

// Excalidraw mutates its internal elements array/objects in place and
// reuses the same references across onChange calls. Holding that reference
// across an `await` (e.g. waiting on image uploads) before serializing it
// means it can change underneath us before we actually send it — cloning
// immediately at capture time eliminates that race.
function cloneElements(elements: readonly unknown[]): unknown[] {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(elements as unknown[]);
    } catch {
      // fall through to JSON clone
    }
  }
  return JSON.parse(JSON.stringify(elements));
}

export function useAutosavePage(pageId: string, options?: AutosaveOptions) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pendingSceneRef = useRef<Scene | null>(null);
  const inFlightRef = useRef(false);
  const inFlightPromiseRef = useRef<Promise<void> | null>(null);

  const performSave = useCallback((): Promise<void> => {
    if (inFlightRef.current) {
      return inFlightPromiseRef.current ?? Promise.resolve();
    }
    if (!pendingSceneRef.current) return Promise.resolve();

    inFlightRef.current = true;

    const run = (async () => {
      while (pendingSceneRef.current) {
        const scene = pendingSceneRef.current;
        pendingSceneRef.current = null;
        setStatus("saving");
        try {
          if (options?.waitForPendingUploads) {
            await Promise.race([
              options.waitForPendingUploads(),
              new Promise((resolve) => setTimeout(resolve, 8000)),
            ]);
          }
          const fileUrls = options?.getFileUrls?.() ?? {};

          const controller = new AbortController();
          const fetchTimer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
          let res: Response;
          try {
            res = await fetch(`/api/pages/${pageId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({
                canvasJson: {
                  elements: scene.elements,
                  appState: pickPersistableAppState(scene.appState),
                  fileUrls,
                },
              }),
            });
          } finally {
            clearTimeout(fetchTimer);
          }
          if (!res.ok) throw new Error("Save failed");
          setStatus("saved");
        } catch {
          setStatus("error");
          break;
        }
      }
      inFlightRef.current = false;
      inFlightPromiseRef.current = null;
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
    })();

    inFlightPromiseRef.current = run;
    return run;
  }, [pageId, queryClient, options]);

  const scheduleSave = useCallback(
    (scene: Scene) => {
      pendingSceneRef.current = { ...scene, elements: cloneElements(scene.elements) };
      if (timerRef.current) clearTimeout(timerRef.current);
      setStatus("idle");
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        performSave();
      }, AUTOSAVE_DELAY_MS);
    },
    [performSave],
  );

  // Clears any pending debounce, then overwrites the pending scene with
  // (in priority order): an explicitly passed scene, a live read from
  // Excalidraw, or whatever was already queued — then kicks off the save.
  const queueImmediate = useCallback(
    (scene?: Scene): Promise<void> => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const sceneToUse = scene ?? options?.getLiveScene?.() ?? null;
      if (sceneToUse) {
        pendingSceneRef.current = { ...sceneToUse, elements: cloneElements(sceneToUse.elements) };
      }
      return performSave();
    },
    [performSave, options],
  );

  // Awaited — for the manual Save button, where a brief wait is expected.
  const saveNow = useCallback(
    async (scene?: Scene) => {
      await queueImmediate(scene);
    },
    [queueImmediate],
  );

  // Fire-and-forget — for back-navigation and tab close. The underlying
  // fetch keeps running in the background regardless of whether the
  // caller awaits it, so nothing is lost by not waiting.
  const flush = useCallback(
    (scene?: Scene) => {
      queueImmediate(scene);
    },
    [queueImmediate],
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      flush();
      if (pendingSceneRef.current || inFlightRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      flush();
    };
  }, [flush]);

  return { status, scheduleSave, flush, saveNow };
}
