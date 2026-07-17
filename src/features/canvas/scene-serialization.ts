// Only these appState fields are meaningful to persist — everything else
// (selection state, collaborators, active tool, etc.) is transient UI state
// that Excalidraw manages itself and should never be round-tripped through
// JSON, since some fields (like `collaborators`, a Map) don't survive
// JSON.stringify/parse correctly and will crash Excalidraw on reload.
const PERSISTABLE_APP_STATE_KEYS = [
  "viewBackgroundColor",
  "currentItemStrokeColor",
  "currentItemBackgroundColor",
  "currentItemFillStyle",
  "currentItemStrokeWidth",
  "currentItemStrokeStyle",
  "currentItemRoughness",
  "currentItemOpacity",
  "currentItemFontFamily",
  "currentItemFontSize",
  "currentItemTextAlign",
  "scrollX",
  "scrollY",
  "zoom",
  "gridSize",
] as const;

export function pickPersistableAppState(
  appState: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of PERSISTABLE_APP_STATE_KEYS) {
    if (key in appState) result[key] = appState[key];
  }
  return result;
}

// Defensive: strips any stray non-serializable fields (like a corrupted
// `collaborators: {}` from data saved before this fix existed) before
// handing appState to Excalidraw as initialData.
export function sanitizeLoadedAppState(
  appState: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!appState) return {};
  const { collaborators, ...safe } = appState;
  return safe;
}
