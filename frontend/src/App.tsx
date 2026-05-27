import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';
import { CheckSquare, Command, FolderKanban, Layers, Moon, Sparkles, Sun, Target } from 'lucide-react';
import { api, setApiAccessToken } from './lib/api';
import type { DashboardStats as StatsType, FetchTasksParams, Task } from './lib/api';
import AuthScreen from './components/AuthScreen';
import CommandPalette from './components/CommandPalette';
import ConfirmationModal from './components/ConfirmationModal';
import DashboardStats from './components/DashboardStats';
import EnergyGrouping from './components/EnergyGrouping';
import Heatmap from './components/Heatmap';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TodayFocus from './components/TodayFocus';
import { Button } from './components/ui/Button';
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from './components/ui/Dialog';
import { Input } from './components/ui/Input';
import { useToast } from './components/ui/Toasts';
import useTheme from './hooks/useTheme';
import { supabase } from './lib/supabase';
import { cn } from './lib/utils';

const ONBOARDING_KEY = 'momentum_onboarded_v1';
const PROFILE_KEY = 'momentum_profile_name_v1';

type AppTab = 'focus' | 'backlog';
type BacklogTab = 'list' | 'energy';

export const App: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<AppTab>('focus');
  const [backlogSubTab, setBacklogSubTab] = useState<BacklogTab>('list');

  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [filters, setFilters] = useState<FetchTasksParams>({
    search: '',
    status: [],
    energyLevel: undefined,
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [draftProfileName, setDraftProfileName] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const completionRate = stats?.completionRate ?? 0;
  const todayCompleted = stats?.completedTodayCount ?? 0;
  const activeCount = stats?.activeTasksCount ?? 0;
  const focusMessage = completionRate >= 70
    ? 'Execution is strong today. Protect deep work blocks.'
    : 'You have room to climb. Ship one high-impact task next.';

  const activeBacklog = useMemo(() => tasks.filter((t) => t.status !== 'COMPLETED'), [tasks]);

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadTasks = async (currentFilters: FetchTasksParams) => {
    setIsLoadingTasks(true);
    try {
      const data = await api.getTasks(currentFilters);
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast({ title: 'Error', description: 'Failed to load objectives.', variant: 'error' });
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    const loadAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setApiAccessToken(data.session?.access_token ?? null);
      setIsAuthReady(true);
    };

    loadAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: string, nextSession: Session | null) => {
      setSession(nextSession ?? null);
      setApiAccessToken(nextSession?.access_token ?? null);
    });

    const isOnboarded = localStorage.getItem(ONBOARDING_KEY) === 'true';
    const savedName = localStorage.getItem(PROFILE_KEY) || '';

    setProfileName(savedName);
    setDraftProfileName(savedName);
    setIsOnboardingOpen(!isOnboarded);
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady || !session) return;
    loadTasks(filters);
    loadStats();
  }, [isAuthReady, session]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleFiltersChange = (newFilters: FetchTasksParams) => {
    setFilters(newFilters);
    loadTasks(newFilters);
  };

  const replaceTaskOptimistic = (id: string, partial: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...partial } : t)));
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    const snapshot = [...tasks];

    replaceTaskOptimistic(id, {
      status: newStatus as Task['status'],
      completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    });

    try {
      const updated = await api.updateTask(id, { status: newStatus });
      replaceTaskOptimistic(id, updated);
      toast({
        title: newStatus === 'COMPLETED' ? 'Objective Completed' : 'Objective Reopened',
        description: `"${updated.title}" moved to ${newStatus === 'COMPLETED' ? 'Completed' : 'Todo'}.`,
        variant: 'success'
      });
      loadStats();
    } catch (err: any) {
      setTasks(snapshot);
      toast({ title: 'Action Failed', description: err?.message || 'Could not update task status.', variant: 'error' });
    }
  };

  const handleStartTask = async (id: string) => {
    const snapshot = [...tasks];
    replaceTaskOptimistic(id, { status: 'IN_PROGRESS', updatedAt: new Date().toISOString() });

    try {
      const updated = await api.updateTask(id, { status: 'IN_PROGRESS' });
      replaceTaskOptimistic(id, updated);
      toast({ title: 'Focus Started', description: `"${updated.title}" is now in progress.`, variant: 'info' });
      loadStats();
    } catch (err: any) {
      setTasks(snapshot);
      toast({ title: 'Action Failed', description: err?.message || 'Could not start focus.', variant: 'error' });
    }
  };

  const handleCreateOrUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
    setIsActionLoading(true);
    const now = new Date().toISOString();

    if (editingTask) {
      const snapshot = [...tasks];
      const optimistic: Task = { ...editingTask, ...taskData, updatedAt: now };
      replaceTaskOptimistic(editingTask.id, optimistic);

      try {
        const updated = await api.updateTask(editingTask.id, taskData);
        replaceTaskOptimistic(editingTask.id, updated);
        toast({ title: 'Task Saved', description: `"${updated.title}" updated.`, variant: 'success' });
      } catch (err: any) {
        setTasks(snapshot);
        toast({ title: 'Action Failed', description: err?.message || 'Error saving task.', variant: 'error' });
        setIsActionLoading(false);
        return;
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const optimisticTask: Task = {
        id: tempId,
        ...taskData,
        completedAt: taskData.status === 'COMPLETED' ? now : null,
        createdAt: now,
        updatedAt: now
      };

      setTasks((prev) => [optimisticTask, ...prev]);

      try {
        const created = await api.createTask(taskData);
        setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
        toast({ title: 'Task Created', description: `"${created.title}" added.`, variant: 'success' });
      } catch (err: any) {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
        toast({ title: 'Action Failed', description: err?.message || 'Error creating task.', variant: 'error' });
        setIsActionLoading(false);
        return;
      }
    }

    setIsFormOpen(false);
    setEditingTask(null);
    setIsActionLoading(false);
    loadStats();
    loadTasks(filters);
  };

  const handleDeleteTaskClick = (id: string) => {
    setTaskToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsActionLoading(true);

    const snapshot = [...tasks];
    const deletingId = taskToDelete;
    setTasks((prev) => prev.filter((t) => t.id !== deletingId));

    try {
      await api.deleteTask(deletingId);
      toast({ title: 'Objective Deleted', description: 'Task removed successfully.', variant: 'success' });
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      loadStats();
    } catch (err: any) {
      setTasks(snapshot);
      toast({ title: 'Action Failed', description: err?.message || 'Could not delete task.', variant: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleNewTaskClick = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const finishOnboarding = () => {
    const name = draftProfileName.trim();
    localStorage.setItem(ONBOARDING_KEY, 'true');
    localStorage.setItem(PROFILE_KEY, name || 'Builder');
    setProfileName(name || 'Builder');
    setIsOnboardingOpen(false);
    toast({ title: 'Welcome to Momentum', description: 'Your workspace is ready.', variant: 'success' });
  };

  const displayName = profileName || 'Builder';

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#030712]">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen onAuthenticated={() => undefined} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#030712] dark:text-slate-100">
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-800/40 dark:bg-slate-950/75">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setActiveTab('focus')}
            className="group flex items-center gap-2"
            aria-label="Go to focus dashboard"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-glow-indigo transition-transform group-hover:scale-105 dark:bg-indigo-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold tracking-tight">Momentum</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Productivity OS</p>
            </div>
          </button>

          <nav className="flex items-center rounded-xl border border-slate-200/50 bg-slate-100/85 p-1 dark:border-slate-800 dark:bg-slate-900/70" aria-label="Primary navigation">
            <button
              onClick={() => setActiveTab('focus')}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-semibold transition-all md:px-4',
                activeTab === 'focus' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
              aria-pressed={activeTab === 'focus'}
            >
              Today Focus
            </button>
            <button
              onClick={() => setActiveTab('backlog')}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-semibold transition-all md:px-4',
                activeTab === 'backlog' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
              aria-pressed={activeTab === 'backlog'}
            >
              Task Master
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 transition hover:text-slate-800 md:flex dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              aria-label="Open command palette"
            >
              <Command className="h-3.5 w-3.5" />
              <span>Command</span>
              <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] dark:border-slate-700">⌘K</kbd>
            </button>
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700 transition hover:scale-[1.03] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Open profile settings"
            >
              {displayName.slice(0, 2).toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="grid gap-3 sm:grid-cols-3" aria-label="Dashboard insights">
          {[
            { label: 'Completion Rate', value: `${completionRate}%`, icon: <Target className="h-4 w-4" /> },
            { label: 'Completed Today', value: `${todayCompleted}`, icon: <CheckSquare className="h-4 w-4" /> },
            { label: 'Active Queue', value: `${activeCount}`, icon: <Sparkles className="h-4 w-4" /> }
          ].map((item) => (
            <motion.article
              key={item.label}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.label}</p>
                <div className="text-indigo-500">{item.icon}</div>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{focusMessage}</p>
            </motion.article>
          ))}
        </section>

        <AnimatePresence mode="wait">
          {activeTab === 'focus' ? (
            <motion.section
              key="focus-view"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="space-y-8"
              aria-label="Today focus view"
            >
              <TodayFocus
                tasks={tasks}
                backlogTasks={activeBacklog}
                onToggleStatus={handleToggleStatus}
                onStartTask={handleStartTask}
                isLoading={isLoadingTasks}
                profileName={displayName}
              />

              <DashboardStats stats={stats} isLoading={isLoadingStats} />
              <Heatmap data={stats?.heatmapData || []} isLoading={isLoadingStats} />
            </motion.section>
          ) : (
            <motion.section
              key="backlog-view"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="space-y-6"
              aria-label="Task master view"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Task Master</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Organize, prioritize, and ship outcomes faster.</p>
                </div>

                <div className="flex shrink-0 items-center rounded-lg border border-slate-200/60 bg-slate-100/85 p-0.5 dark:border-slate-800 dark:bg-slate-900/60">
                  <button
                    onClick={() => setBacklogSubTab('list')}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                      backlogSubTab === 'list' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    )}
                    aria-pressed={backlogSubTab === 'list'}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Backlog List
                  </button>
                  <button
                    onClick={() => setBacklogSubTab('energy')}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                      backlogSubTab === 'energy' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    )}
                    aria-pressed={backlogSubTab === 'energy'}
                  >
                    <FolderKanban className="h-3.5 w-3.5" />
                    Energy Board
                  </button>
                </div>
              </div>

              {backlogSubTab === 'list' ? (
                <TaskList
                  tasks={tasks}
                  onToggleStatus={handleToggleStatus}
                  onEditTask={(task) => {
                    setEditingTask(task);
                    setIsFormOpen(true);
                  }}
                  onDeleteTask={handleDeleteTaskClick}
                  onNewTask={handleNewTaskClick}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  isLoading={isLoadingTasks}
                />
              ) : (
                <EnergyGrouping tasks={tasks} onEditTask={(task) => {
                  setEditingTask(task);
                  setIsFormOpen(true);
                }} isLoading={isLoadingTasks} />
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
        task={editingTask}
        isLoading={isActionLoading}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Objective"
        description="Are you sure you want to delete this objective? This cannot be undone."
        isLoading={isActionLoading}
      />

      <Dialog isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Momentum</DialogTitle>
          <DialogDescription>Set your profile once. We’ll personalize your focus workflow around it.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-5 dark:border-slate-800 dark:from-indigo-950/40 dark:via-slate-900 dark:to-cyan-950/30">
            <p className="text-sm text-slate-600 dark:text-slate-300">Momentum is built for focused execution, not task clutter. Let’s tune your workspace.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="profile-name" className="text-sm font-medium">Your name</label>
            <Input
              id="profile-name"
              value={draftProfileName}
              onChange={(e) => setDraftProfileName(e.target.value)}
              placeholder="Alex"
              autoFocus
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={finishOnboarding} className="px-5">
              Launch Dashboard
            </Button>
          </div>
        </div>
      </Dialog>

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNewTask={() => {
          setIsCommandOpen(false);
          handleNewTaskClick();
        }}
        onOpenFocus={() => {
          setIsCommandOpen(false);
          setActiveTab('focus');
        }}
        onOpenBacklog={() => {
          setIsCommandOpen(false);
          setActiveTab('backlog');
          setBacklogSubTab('list');
        }}
        onOpenEnergyBoard={() => {
          setIsCommandOpen(false);
          setActiveTab('backlog');
          setBacklogSubTab('energy');
        }}
        onToggleTheme={() => {
          setIsCommandOpen(false);
          toggleTheme();
        }}
      />
    </div>
  );
};

export default App;
