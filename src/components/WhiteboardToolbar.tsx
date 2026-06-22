import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { BoardMeta, StickyColor } from '../lib/whiteboard/types';

type IconName =
  | 'new'
  | 'duplicate'
  | 'rename'
  | 'delete'
  | 'share';

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
    default:
      return null;
  }
}

type WhiteboardToolbarProps = {
  boards: BoardMeta[];
  activeBoardId: string;
  saveStatus: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
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
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45',
        base,
      ]
        .join(' ')
        .trim()}
    >
      <span className="shrink-0">{icon}</span>
    </button>
  );
}

export default function WhiteboardToolbar({
  boards,
  activeBoardId,
  saveStatus,
  collapsed,
  onToggleCollapse,
  onSwitchBoard,
  onCreateBoard,
  onRenameBoard,
  onDuplicateBoard,
  onDeleteBoard,
  onAddSticky,
  onCopyShareLink,
}: WhiteboardToolbarProps) {
  const activeBoard = useMemo(
    () => boards.find((board) => board.id === activeBoardId),
    [activeBoardId, boards],
  );

  return (
    <aside
      className={[
        'h-full rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80',
        collapsed ? 'p-2' : 'p-4',
      ]
        .join(' ')
        .trim()}
    >
      <div className={collapsed ? 'space-y-2' : 'space-y-5'}>
        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            {!collapsed && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-400">
                Boards
              </p>
            )}
            <button
              type="button"
              onClick={onToggleCollapse}
              title={collapsed ? 'Expand panel' : 'Collapse panel'}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {collapsed ? '>>' : '<<'}
            </button>
          </div>

          {collapsed ? (
            <div className="space-y-2">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-2 py-2 text-center text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {activeBoard?.name ? activeBoard.name.slice(0, 2).toUpperCase() : 'B'}
              </div>
              <ActionButton
                label="Share URL"
                icon={<Icon name="share" />}
                onClick={onCopyShareLink}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <select
                value={activeBoardId}
                onChange={(event) => onSwitchBoard(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">{saveStatus}</p>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <ActionButton
                  label="Share URL"
                  icon={<Icon name="share" />}
                  onClick={onCopyShareLink}
                />
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
              </div>
            </div>
          )}
        </section>

        {!collapsed && (
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-400">
              Sticky On Board
            </p>
            <form
              className="mt-3 space-y-2"
              onSubmit={(event) => {
                event.preventDefault();

                const form = event.currentTarget;
                const textInput = form.elements.namedItem('sticky-text') as HTMLInputElement | null;
                const colorInput = form.elements.namedItem('sticky-color') as HTMLSelectElement | null;

                if (!textInput || !colorInput) {
                  return;
                }

                const text = textInput.value.trim();

                if (!text) {
                  return;
                }

                onAddSticky(text, colorInput.value as StickyColor);
                textInput.value = '';
              }}
            >
              <textarea
                name="sticky-text"
                placeholder="Type a short note..."
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              ></textarea>
              <div className="flex items-center gap-2">
                <select
                  name="sticky-color"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  defaultValue="amber"
                >
                  <option value="amber">Amber</option>
                  <option value="mint">Mint</option>
                  <option value="blue">Blue</option>
                  <option value="rose">Rose</option>
                </select>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600 dark:bg-white dark:text-slate-900 dark:hover:bg-brand-400"
                >
                  Add to Board
                </button>
              </div>
            </form>
          </section>
        )}

      </div>
    </aside>
  );
}
