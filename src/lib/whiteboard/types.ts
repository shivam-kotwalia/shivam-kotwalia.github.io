export type JsonObject = Record<string, unknown>;

export type StickyColor = 'amber' | 'mint' | 'blue' | 'rose';

export interface StickyNote {
  id: string;
  text: string;
  color: StickyColor;
  updatedAt: number;
}

export interface BoardScene {
  elements: unknown[];
  appState: JsonObject;
  files: JsonObject;
  stickyNotes: StickyNote[];
}

export interface BoardMeta {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_SCENE: BoardScene = {
  elements: [],
  appState: {},
  files: {},
  stickyNotes: [],
};
