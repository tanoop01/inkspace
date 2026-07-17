"use client";

import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Loading canvas...
      </div>
    ),
  },
);

type ExcalidrawSceneData = {
  elements?: unknown[];
  appState?: Record<string, unknown>;
  files?: Record<string, unknown>;
};

export function ExcalidrawCanvas({
  initialData,
  onChange,
  onApiReady,
}: {
  initialData?: ExcalidrawSceneData;
  onChange?: (elements: readonly unknown[], appState: unknown, files: unknown) => void;
  onApiReady?: (api: unknown) => void;
}) {
  return (
    <div className="h-full w-full">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Excalidraw
        initialData={initialData as any}
        onChange={onChange as any}
        excalidrawAPI={(api: any) => onApiReady?.(api)}
        theme="light"
      />
    </div>
  );
}
