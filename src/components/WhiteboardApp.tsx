import { useCallback, useEffect, useRef, useState } from 'react';
import { Excalidraw, convertToExcalidrawElements, exportToBlob } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import WhiteboardToolbar from './WhiteboardToolbar';
import {
  createBoard,
  deleteBoard,
  duplicateBoard,
  ensureDefaultBoard,
  getBoards,
  renameBoard,
  setActiveBoardId as persistActiveBoardId,
  touchBoard,
} from '../lib/whiteboard/boards';
import { createShareUrl, sceneFromShareUrl } from '../lib/whiteboard/export';
import { deleteScene, loadScene, saveScene } from '../lib/whiteboard/storage';
import type { BoardMeta, BoardScene, StickyColor } from '../lib/whiteboard/types';

type ExcalidrawApiLike = {
  getSceneElements: () => unknown[];
  getAppState: () => Record<string, unknown>;
  getFiles: () => Record<string, unknown>;
  updateScene: (sceneData: {
    elements?: unknown[];
    appState?: Record<string, unknown>;
    collaborators?: unknown;
    captureUpdate?: unknown;
  }) => void;
};

function buildDefaultScene(): BoardScene {
  return {
    elements: [],
    appState: {},
    files: {},
    stickyNotes: [],
  };
}

function stripTransientAppState(appState: Record<string, unknown>): Record<string, unknown> {
  const {
    collaborators,
    selectedElementIds,
    selectedGroupIds,
    editingElement,
    activeEmbeddable,
    cursorButton,
    ...persisted
  } = appState;

  void collaborators;
  void selectedElementIds;
  void selectedGroupIds;
  void editingElement;
  void activeEmbeddable;
  void cursorButton;

  return persisted;
}

export default function WhiteboardApp() {
  const [boards, setBoards] = useState<BoardMeta[]>([]);
  const [activeBoardId, setActiveBoardId] = useState('');
  const [initialData, setInitialData] = useState(() => ({
    elements: [] as unknown[],
    appState: {} as Record<string, unknown>,
    files: {} as Record<string, unknown>,
  }));
  const [canvasVersion, setCanvasVersion] = useState(0);
  const [saveStatus, setSaveStatus] = useState('Initializing...');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const saveTimerRef = useRef<number | null>(null);
  const apiRef = useRef<ExcalidrawApiLike | null>(null);
  const sceneRef = useRef<BoardScene>(buildDefaultScene());
  const activeBoardIdRef = useRef('');

  const panelLayoutClass = leftCollapsed
    ? rightCollapsed
      ? 'xl:grid-cols-[70px_minmax(0,1fr)_70px]'
      : 'xl:grid-cols-[70px_minmax(0,1fr)_240px]'
    : rightCollapsed
      ? 'xl:grid-cols-[280px_minmax(0,1fr)_70px]'
      : 'xl:grid-cols-[280px_minmax(0,1fr)_240px]';

  const refreshBoardList = useCallback(() => {
    setBoards(getBoards());
  }, []);

  const persistCurrentScene = useCallback(
    (nextScene: BoardScene, immediate = false) => {
      sceneRef.current = nextScene;

      const boardId = activeBoardIdRef.current;
      if (!boardId) {
        return;
      }

      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }

      const save = () => {
        saveScene(boardId, nextScene);
        touchBoard(boardId);
        refreshBoardList();
        setSaveStatus(`Saved ${new Date().toLocaleTimeString()}`);
      };

      if (immediate) {
        save();
        return;
      }

      setSaveStatus('Saving...');
      saveTimerRef.current = window.setTimeout(save, 450);
    },
    [refreshBoardList],
  );

  useEffect(() => {
    const { boards: initialBoards, activeBoardId: defaultBoardId } = ensureDefaultBoard();
    const sharedScene = sceneFromShareUrl();

    let nextScene = loadScene(defaultBoardId);
    if (sharedScene) {
      nextScene = sharedScene;
      saveScene(defaultBoardId, sharedScene);
    }

    setBoards(initialBoards);
    setActiveBoardId(defaultBoardId);
    activeBoardIdRef.current = defaultBoardId;
    sceneRef.current = nextScene;
    setInitialData({
      elements: nextScene.elements,
      appState: nextScene.appState,
      files: nextScene.files,
    });
    setCanvasVersion((version) => version + 1);
    setSaveStatus(sharedScene ? 'Loaded from share link' : 'Autosave ready');
    const storedLeft = window.localStorage.getItem('whiteboard:left-collapsed:v1');
    const storedRight = window.localStorage.getItem('whiteboard:right-collapsed:v1');

    setLeftCollapsed(storedLeft === null ? true : storedLeft === '1');
    setRightCollapsed(storedRight === null ? false : storedRight === '1');

    const applyTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    applyTheme();

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const switchBoard = useCallback((boardId: string) => {
    setActiveBoardId(boardId);
    activeBoardIdRef.current = boardId;
    persistActiveBoardId(boardId);
    const nextScene = loadScene(boardId);
    sceneRef.current = nextScene;
    setInitialData({
      elements: nextScene.elements,
      appState: nextScene.appState,
      files: nextScene.files,
    });
    setCanvasVersion((version) => version + 1);
    setSaveStatus('Board loaded');
  }, []);

  const toggleLeftPanel = useCallback(() => {
    setLeftCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem('whiteboard:left-collapsed:v1', next ? '1' : '0');
      return next;
    });
  }, []);

  const toggleRightPanel = useCallback(() => {
    setRightCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem('whiteboard:right-collapsed:v1', next ? '1' : '0');
      return next;
    });
  }, []);

  const createBoardAction = useCallback(() => {
    const board = createBoard();
    refreshBoardList();
    switchBoard(board.id);
  }, [refreshBoardList, switchBoard]);

  const renameBoardAction = useCallback(() => {
    if (!activeBoardId) {
      return;
    }

    const currentBoard = boards.find((board) => board.id === activeBoardId);
    const suggestedName = currentBoard?.name || 'Board';
    const input = window.prompt('Rename this board', suggestedName);

    if (!input) {
      return;
    }

    setBoards(renameBoard(activeBoardId, input));
  }, [activeBoardId, boards]);

  const duplicateBoardAction = useCallback(() => {
    if (!activeBoardId) {
      return;
    }

    const board = duplicateBoard(activeBoardId);
    saveScene(board.id, sceneRef.current);
    refreshBoardList();
    switchBoard(board.id);
  }, [activeBoardId, refreshBoardList, switchBoard]);

  const deleteBoardAction = useCallback(() => {
    if (!activeBoardId || boards.length <= 1) {
      return;
    }

    if (!window.confirm('Delete this board? This action cannot be undone.')) {
      return;
    }

    deleteScene(activeBoardId);
    const result = deleteBoard(activeBoardId);
    setBoards(result.boards);
    switchBoard(result.activeBoardId);
  }, [activeBoardId, boards.length, switchBoard]);

  const addSticky = useCallback(
    (text: string, color: StickyColor) => {
      const palette: Record<StickyColor, { fill: string; stroke: string }> = {
        amber: { fill: '#FEF3C7', stroke: '#D97706' },
        mint: { fill: '#D1FAE5', stroke: '#059669' },
        blue: { fill: '#DBEAFE', stroke: '#2563EB' },
        rose: { fill: '#FFE4E6', stroke: '#E11D48' },
      };

      const currentElements = (apiRef.current?.getSceneElements() ?? sceneRef.current.elements) as unknown[];
      const currentAppState =
        (apiRef.current?.getAppState() as unknown as Record<string, unknown>) ?? sceneRef.current.appState;
      const currentFiles =
        (apiRef.current?.getFiles() as unknown as Record<string, unknown>) ?? sceneRef.current.files;

      // Place near viewport center using Excalidraw scroll + zoom state
      const scrollX = typeof currentAppState.scrollX === 'number' ? currentAppState.scrollX : 0;
      const scrollY = typeof currentAppState.scrollY === 'number' ? currentAppState.scrollY : 0;
      const zoomVal =
        currentAppState.zoom != null &&
        typeof (currentAppState.zoom as Record<string, unknown>).value === 'number'
          ? ((currentAppState.zoom as Record<string, unknown>).value as number)
          : 1;
      const stickyW = 240;
      const stickyH = 140;
      const viewW = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const viewH = typeof window !== 'undefined' ? window.innerHeight : 800;
      // Viewport center in canvas coordinates
      const centerX = -scrollX + viewW / 2 / zoomVal;
      const centerY = -scrollY + viewH / 2 / zoomVal;
      // Small stagger so consecutive stickies don't overlap exactly
      const jitter = (currentElements.length % 8) * 36 - 126;
      const x = centerX - stickyW / 2 + jitter;
      const y = centerY - stickyH / 2 + jitter * 0.6;

      const stickyElements = convertToExcalidrawElements([
        {
          type: 'rectangle',
          x,
          y,
          width: 240,
          height: 140,
          backgroundColor: palette[color].fill,
          strokeColor: palette[color].stroke,
          strokeWidth: 1.5,
          roughness: 0,
          fillStyle: 'solid',
          roundness: { type: 3 },
          label: {
            text,
            fontSize: 20,
            textAlign: 'left',
            verticalAlign: 'top',
          },
        },
      ]);

      const nextElements = [...currentElements, ...stickyElements];

      apiRef.current?.updateScene({
        elements: nextElements,
        appState: currentAppState,
      });

      persistCurrentScene(
        {
          ...sceneRef.current,
          elements: nextElements,
          appState: stripTransientAppState(currentAppState),
          files: currentFiles,
        },
        true,
      );
    },
    [persistCurrentScene],
  );

  const handleCanvasChange = useCallback(
    (elements: unknown[], appState: Record<string, unknown>, files: Record<string, unknown>) => {
      const nextScene: BoardScene = {
        ...sceneRef.current,
        elements,
        appState: stripTransientAppState(appState),
        files,
      };

      persistCurrentScene(nextScene);
    },
    [persistCurrentScene],
  );

  const copyShareLink = useCallback(async () => {
    try {
      const base = `${window.location.origin}${window.location.pathname}`;
      const url = createShareUrl(sceneRef.current, base);
      await navigator.clipboard.writeText(url);
      setSaveStatus('Share URL copied to clipboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create share URL.';
      window.alert(message);
    }
  }, []);

  return (
    <div className={`grid gap-3 ${panelLayoutClass}`}>
      <WhiteboardToolbar
        boards={boards}
        activeBoardId={activeBoardId}
        saveStatus={saveStatus}
        collapsed={leftCollapsed}
        onToggleCollapse={toggleLeftPanel}
        onSwitchBoard={switchBoard}
        onCreateBoard={createBoardAction}
        onRenameBoard={renameBoardAction}
        onDuplicateBoard={duplicateBoardAction}
        onDeleteBoard={deleteBoardAction}
        onAddSticky={addSticky}
        onCopyShareLink={copyShareLink}
      />

      <div className="space-y-3">
        <section className="h-[76vh] min-h-[620px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
          <Excalidraw
            key={`${activeBoardId}-${canvasVersion}`}
            initialData={initialData as never}
            theme={theme}
            excalidrawAPI={(nextApi) => {
              apiRef.current = nextApi as unknown as ExcalidrawApiLike;
            }}
            onChange={(elements, appState, files) =>
              handleCanvasChange(
                elements as unknown[],
                appState as unknown as Record<string, unknown>,
                files as Record<string, unknown>,
              )
            }
            UIOptions={{
              canvasActions: {
                saveToActiveFile: false,
                loadScene: false,
                toggleTheme: false,
              },
            }}
          />
        </section>

        <p className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
          Shortcuts: hold Space to pan, Ctrl/Cmd + Z for undo, Shift + drag for straight lines.
        </p>
      </div>

      <aside
        className={[
          'h-full rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80',
          rightCollapsed ? 'p-2' : 'p-4',
        ]
          .join(' ')
          .trim()}
      >
        <div className={rightCollapsed ? 'space-y-2' : 'space-y-4'}>
          <div className="flex items-center justify-between gap-2">
            {!rightCollapsed && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-400">
                Right Panel
              </p>
            )}
            <button
              type="button"
              onClick={toggleRightPanel}
              title={rightCollapsed ? 'Expand panel' : 'Collapse panel'}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {rightCollapsed ? '<<' : '>>'}
            </button>
          </div>

          {rightCollapsed ? (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-2 py-2 text-center text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              RP
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              Shivam Kotwalia
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
