import type { BoardScene } from './types';
import { DEFAULT_SCENE } from './types';

const SCENE_PREFIX = 'whiteboard:scene:v1:';

function readJson<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function cloneDefaultScene(): BoardScene {
  return {
    elements: [],
    appState: {},
    files: {},
    stickyNotes: [],
  };
}

export function sceneStorageKey(boardId: string): string {
  return `${SCENE_PREFIX}${boardId}`;
}

export function loadScene(boardId: string): BoardScene {
  if (typeof window === 'undefined') {
    return cloneDefaultScene();
  }

  const fallback = cloneDefaultScene();
  const scene = readJson<BoardScene>(window.localStorage.getItem(sceneStorageKey(boardId)), fallback);

  return {
    elements: Array.isArray(scene.elements) ? scene.elements : DEFAULT_SCENE.elements,
    appState: scene.appState && typeof scene.appState === 'object' ? scene.appState : DEFAULT_SCENE.appState,
    files: scene.files && typeof scene.files === 'object' ? scene.files : DEFAULT_SCENE.files,
    stickyNotes: Array.isArray(scene.stickyNotes) ? scene.stickyNotes : DEFAULT_SCENE.stickyNotes,
  };
}

export function saveScene(boardId: string, scene: BoardScene): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(sceneStorageKey(boardId), JSON.stringify(scene));
}

export function deleteScene(boardId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(sceneStorageKey(boardId));
}
