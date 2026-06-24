import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { BoardMeta, StickyColor } from '../lib/whiteboard/types';

type IconName =
  | 'boards'
  | 'new'
  | 'duplicate'
  | 'rename'
  | 'delete'
  | 'share'
  | 'sticky';

function Icon({ name }: { name: IconName }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'boards':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="4" rx="1" />
          <rect x="3" y="10" width="18" height="4" rx="1" />
          <rect x="3" y="16" width="18" height="4" rx="1" />
        </svg>
      );
    case 'new':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'duplicate':
      return (
        <svg {...common}>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      );
    case 'rename':
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      );
    case 'delete':
      return (
        <svg {...common}>
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      );
    case 'share':
      return (
        <svg {...common}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      );
    case 'sticky':
      return (
        <svg {...common}>
          <path d="M6 3h12a2 2 0 0 1 2 2v9l-5 5H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M15 19v-5h5" />
        </svg>
      );
    default:
      return null;
  }
}

type WhiteboardToolbarProps = {
  boards: BoardMeta[];
  activeBoardId: string;
  onSwitchBoard: (boardId: string) => void;
  onCreateBoard: () => void;
  onRenameBoard: () => void;
  onDuplicateBoard: () => void;
  onDeleteBoard: () => void;
  onAddSticky: (text: string, color: StickyColor) => void;
  onCopyShareLink: () => void;
};

type ActionButtonProps = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

function ActionButton({
  label,
  icon,
  onClick,
  tone = 'default',
  disabled = false,
}: ActionButtonProps) {
  const base =
    tone === 'danger'
      ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50'
      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800';

  return (
    <div className="group relative z-[100]">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={[
          'inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45',
          base,
        ]
          .join(' ')
          .trim()}
      >
        <span className="shrink-0">{icon}</span>
      </button>
      <div className="pointer-events-none absolute left-full top-1/2 z-[9999] ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 dark:border-slate-600 dark:bg-slate-700">
        {label}
      </div>
    </div>
  );
}

export default function WhiteboardToolbar({
  boards,
  activeBoardId,
  onSwitchBoard,
  onCreateBoard,
  onRenameBoard,
  onDuplicateBoard,
  onDeleteBoard,
  onAddSticky,
  onCopyShareLink,
}: WhiteboardToolbarProps) {
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  
  const activeBoard = useMemo(
    () => boards.find((board) => board.id === activeBoardId),
    [activeBoardId, boards],
  );
  const activeIndex = useMemo(
    () => boards.findIndex((board) => board.id === activeBoardId),
    [activeBoardId, boards],
  );

  const addStickyQuick = () => {
    const rawText = window.prompt('Sticky note text');
    const text = rawText?.trim();

    if (!text) {
      return;
    }

    onAddSticky(text, 'amber');
  };

  return (
    <aside
      className="relative z-50 h-full overflow-visible rounded-3xl border border-slate-200/80 bg-white/90 p-1 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div className="flex h-full flex-col items-center gap-1">
        <div className="group relative">
          <button
            type="button"
            onClick={() => setShowBoardDropdown(!showBoardDropdown)}
            className="rounded-xl border border-slate-200/80 bg-slate-50 px-1.5 py-1.5 text-center text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            title={`${activeBoard?.name || 'Board'} (${activeIndex + 1}/${boards.length})`}
          >
            {activeBoard?.name ? activeBoard.name.slice(0, 2).toUpperCase() : 'B'}
          </button>
          
          {showBoardDropdown && (
            <div className="absolute left-full top-0 z-[9999] ml-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Boards ({boards.length})
              </div>
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => {
                    onSwitchBoard(board.id);
                    setShowBoardDropdown(false);
                  }}
                  className={[
                    'w-full px-3 py-2 text-left text-sm transition-colors',
                    board.id === activeBoardId
                      ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800',
                  ].join(' ')}
                >
                  {board.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <ActionButton label="Share URL" icon={<Icon name="share" />} onClick={onCopyShareLink} />
        <ActionButton label="New" icon={<Icon name="new" />} onClick={onCreateBoard} />
        <ActionButton label="Duplicate" icon={<Icon name="duplicate" />} onClick={onDuplicateBoard} />
        <ActionButton label="Rename" icon={<Icon name="rename" />} onClick={onRenameBoard} />
        <ActionButton
          label="Delete"
          icon={<Icon name="delete" />}
          onClick={onDeleteBoard}
          tone="danger"
          disabled={boards.length <= 1}
        />
        <ActionButton label="Add Sticky" icon={<Icon name="sticky" />} onClick={addStickyQuick} />
      </div>
    </aside>
  );
}
