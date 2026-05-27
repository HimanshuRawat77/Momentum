import React from 'react';
import { CheckSquare, Command, Layers, Moon, Sparkles, Sun } from 'lucide-react';
import { Dialog } from './ui/Dialog';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewTask: () => void;
  onOpenFocus: () => void;
  onOpenBacklog: () => void;
  onOpenEnergyBoard: () => void;
  onToggleTheme: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewTask,
  onOpenFocus,
  onOpenBacklog,
  onOpenEnergyBoard,
  onToggleTheme
}) => {
  const actions = [
    { label: 'Create new objective', hint: 'N', icon: <Sparkles className="h-4 w-4" />, run: onNewTask },
    { label: 'Go to Today Focus', hint: 'G F', icon: <CheckSquare className="h-4 w-4" />, run: onOpenFocus },
    { label: 'Open Task Master', hint: 'G B', icon: <Layers className="h-4 w-4" />, run: onOpenBacklog },
    { label: 'Open Energy Board', hint: 'G E', icon: <Layers className="h-4 w-4" />, run: onOpenEnergyBoard },
    { label: 'Toggle theme', hint: 'T', icon: <Moon className="h-4 w-4" />, run: onToggleTheme }
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-2xl p-0 overflow-hidden">
      <div className="border-b border-slate-200/70 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Command className="h-4 w-4" />
          <span>Command Palette</span>
          <kbd className="ml-auto rounded border border-slate-200 px-1.5 py-0.5 text-[10px] dark:border-slate-700">ESC</kbd>
        </div>
      </div>

      <div className="max-h-[65vh] overflow-y-auto p-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.run}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="text-indigo-500">{action.icon}</div>
            <span className="text-sm font-medium">{action.label}</span>
            <kbd className="ml-auto rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500 dark:border-slate-700 dark:text-slate-400">{action.hint}</kbd>
          </button>
        ))}

        <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
          <Sun className="h-3.5 w-3.5" />
          Press <kbd className="rounded border border-slate-200 px-1 dark:border-slate-700">Ctrl/Cmd + K</kbd> anytime.
        </div>
      </div>
    </Dialog>
  );
};

export default CommandPalette;
