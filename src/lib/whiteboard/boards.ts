import type { BoardMeta } from './types';

const BOARD_INDEX_KEY = 'whiteboard:boards:v1';
const ACTIVE_BOARD_KEY = 'whiteboard:active-board:v1';

function now(): number {
  return Date.now();
}

function makeBoardId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `board-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

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

export function getBoards(): BoardMeta[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const boards = readJson<BoardMeta[]>(window.localStorage.getItem(BOARD_INDEX_KEY), []);
  return boards.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveBoards(boards: BoardMeta[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(BOARD_INDEX_KEY, JSON.stringify(boards));
}

export function getActiveBoardId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(ACTIVE_BOARD_KEY);
}

export function setActiveBoardId(boardId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ACTIVE_BOARD_KEY, boardId);
}

export function ensureDefaultBoard(): { boards: BoardMeta[]; activeBoardId: string } {
  const existingBoards = getBoards();
  const activeBoardId = getActiveBoardId();

  if (existingBoards.length === 0) {
    const createdAt = now();
    const board: BoardMeta = {
      id: makeBoardId(),
      name: 'Board 1',
      createdAt,
      updatedAt: createdAt,
    };

    saveBoards([board]);
    setActiveBoardId(board.id);

    return { boards: [board], activeBoardId: board.id };
  }

  const resolvedActiveId = existingBoards.some((board) => board.id === activeBoardId)
    ? (activeBoardId as string)
    : existingBoards[0].id;

  setActiveBoardId(resolvedActiveId);

  return { boards: existingBoards, activeBoardId: resolvedActiveId };
}

export function createBoard(name?: string): BoardMeta {
  const boards = getBoards();
  const createdAt = now();
  const board: BoardMeta = {
    id: makeBoardId(),
    name: name?.trim() || `Board ${boards.length + 1}`,
    createdAt,
    updatedAt: createdAt,
  };

  saveBoards([board, ...boards]);
  setActiveBoardId(board.id);

  return board;
}

export function renameBoard(boardId: string, name: string): BoardMeta[] {
  const nextBoards = getBoards().map((board) =>
    board.id === boardId
      ? {
          ...board,
          name: name.trim() || board.name,
          updatedAt: now(),
        }
      : board,
  );

  saveBoards(nextBoards);
  return nextBoards;
}

export function touchBoard(boardId: string): BoardMeta[] {
  const nextBoards = getBoards().map((board) =>
    board.id === boardId ? { ...board, updatedAt: now() } : board,
  );

  saveBoards(nextBoards);
  return nextBoards;
}

export function duplicateBoard(sourceBoardId: string): BoardMeta {
  const source = getBoards().find((board) => board.id === sourceBoardId);
  const createdAt = now();
  const board: BoardMeta = {
    id: makeBoardId(),
    name: source ? `${source.name} copy` : 'Board copy',
    createdAt,
    updatedAt: createdAt,
  };

  saveBoards([board, ...getBoards()]);
  setActiveBoardId(board.id);

  return board;
}

export function deleteBoard(boardId: string): { boards: BoardMeta[]; activeBoardId: string } {
  const remainingBoards = getBoards().filter((board) => board.id !== boardId);

  if (remainingBoards.length === 0) {
    const createdAt = now();
    const fallbackBoard: BoardMeta = {
      id: makeBoardId(),
      name: 'Board 1',
      createdAt,
      updatedAt: createdAt,
    };

    saveBoards([fallbackBoard]);
    setActiveBoardId(fallbackBoard.id);

    return {
      boards: [fallbackBoard],
      activeBoardId: fallbackBoard.id,
    };
  }

  const nextActiveBoardId = remainingBoards[0].id;
  saveBoards(remainingBoards);
  setActiveBoardId(nextActiveBoardId);

  return {
    boards: remainingBoards,
    activeBoardId: nextActiveBoardId,
  };
}
