import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import type { BoardScene } from './types';

const SHARE_PARAM = 'wb';
const MAX_SHARE_LENGTH = 9000;

export function sceneToJson(scene: BoardScene): string {
  return JSON.stringify(scene, null, 2);
}

export function sceneFromJson(raw: string): BoardScene {
  const data = JSON.parse(raw) as BoardScene;

  return {
    elements: Array.isArray(data.elements) ? data.elements : [],
    appState: data.appState && typeof data.appState === 'object' ? data.appState : {},
    files: data.files && typeof data.files === 'object' ? data.files : {},
    stickyNotes: Array.isArray(data.stickyNotes) ? data.stickyNotes : [],
  };
}

export function downloadTextFile(filename: string, content: string, mimeType = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function createShareUrl(scene: BoardScene, baseUrl?: string): string {
  const payload = compressToEncodedURIComponent(JSON.stringify(scene));

  if (!payload || payload.length > MAX_SHARE_LENGTH) {
    throw new Error('This board is too large to share via URL. Please export JSON instead.');
  }

  const url = new URL(baseUrl || window.location.href);
  url.searchParams.set(SHARE_PARAM, payload);

  return url.toString();
}

export function sceneFromShareUrl(urlString?: string): BoardScene | null {
  const url = new URL(urlString || window.location.href);
  const payload = url.searchParams.get(SHARE_PARAM);

  if (!payload) {
    return null;
  }

  const json = decompressFromEncodedURIComponent(payload);

  if (!json) {
    return null;
  }

  return sceneFromJson(json);
}
