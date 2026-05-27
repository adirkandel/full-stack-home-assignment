import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bot,
  CheckCircle2,
  Circle,
  ClipboardList,
  Columns3,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Plus,
  Search,
  Table2,
  Trash2,
} from 'lucide-react';
import { TaskForm } from '../components/TaskForm';
import { AssistantPanel } from '../components/AssistantPanel';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../auth/useAuth';
import {
  buildTaskStats,
  formatEnumLabel,
  formatShortDateTime,
  priorityBadgeClass,
} from '../utils/taskFormatting';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
  type TaskEditableFields,
  type TaskFilters,
  type TaskPriority,
  type TaskStatus,
  type UpdateTaskInput,
} from '../types';

type DashboardView = 'board' | 'table';
type StatusFilter = TaskStatus | 'ALL';
type PriorityFilter = TaskPriority | 'ALL';

const dashboardViews: Array<{ id: DashboardView; label: string; icon: typeof Columns3 }> = [
  { id: 'board', label: 'Board', icon: Columns3 },
  { id: 'table', label: 'Table', icon: Table2 },
];

export const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { logout, user } = useAuth();

  const search = searchParams.get('search') ?? '';
  const status = parseStatusFilter(searchParams.get('status'));
  const priority = parsePriorityFilter(searchParams.get('priority'));
  const view = parseDashboardView(searchParams.get('view'));

  const filters = useMemo<TaskFilters>(
    () => ({
      search: search.trim() || undefined,
      status: status === 'ALL' ? undefined : status,
      priority: priority === 'ALL' ? undefined : priority,
    }),
    [priority, search, status],
  );

  const { tasks, loading, error, createTask, updateTask, deleteTask, refetch } = useTasks(filters);
  const stats = useMemo(() => buildTaskStats(tasks), [tasks]);
  const hasFilters = Boolean(filters.search || filters.status || filters.priority);

  const setParam = (key: string, value?: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (!value || value === 'ALL') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    setSearchParams(nextParams);
  };

  const handleCreateTask = async (taskData: TaskEditableFields) => {
    setCreateBusy(true);
    setActionError(null);

    try {
      await createTask(taskData);
      setShowForm(false);
    } catch (createError) {
      setActionError(messageForError(createError));
    } finally {
      setCreateBusy(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setActionError(null);

    try {
      await deleteTask(taskId);
    } catch (deleteError) {
      setActionError(messageForError(deleteError));
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: UpdateTaskInput) => {
    setActionError(null);

    try {
      await updateTask(taskId, taskData);
    } catch (updateError) {
      setActionError(messageForError(updateError));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold text-cyan-700">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Team task command center
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-normal text-zinc-950">Dashboard</h1>
              {user && (
                <p className="mt-1 text-sm text-zinc-600">
                  Welcome, {user.name || user.username}!
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/assistant"
                className="inline-flex items-center gap-2 rounded border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-100"
              >
                <Bot className="h-4 w-4" aria-hidden="true" />
                Assistant
              </Link>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded bg-zinc-950 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                New Task
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </div>
          </div>

          <nav aria-label="Dashboard views" className="flex flex-wrap gap-2">
            {dashboardViews.map((item) => {
              const Icon = item.icon;
              const selected = view === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setParam('view', item.id)}
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-2 rounded border px-3 py-2 text-sm font-semibold transition ${
                    selected
                      ? 'border-zinc-950 bg-zinc-950 text-white'
                      : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section aria-label="Task metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Open tasks" value={stats.open} tone="cyan" icon={ClipboardList} />
          <Metric label="In progress" value={stats.inProgress} tone="amber" icon={Circle} />
          <Metric label="Done" value={stats.done} tone="emerald" icon={CheckCircle2} />
          <Metric label="High priority" value={stats.highPriority} tone="rose" icon={ListFilter} />
        </section>

        <section className="grid gap-4 border-y border-zinc-200 bg-white px-4 py-4 shadow-sm sm:rounded-lg sm:border">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
            <label className="block text-sm font-semibold text-zinc-700">
              Search
              <span className="relative mt-1 block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setParam('search', event.target.value)}
                  placeholder="Search task titles or descriptions"
                  className="w-full rounded border border-zinc-300 py-2 pl-9 pr-3 text-sm font-normal focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                />
              </span>
            </label>

            <SelectFilter
              label="Status"
              allLabel="All statuses"
              value={status}
              values={['ALL', ...TASK_STATUSES]}
              onChange={(value) => setParam('status', value)}
            />
            <SelectFilter
              label="Priority"
              allLabel="All priorities"
              value={priority}
              values={['ALL', ...TASK_PRIORITIES]}
              onChange={(value) => setParam('priority', value)}
            />
          </div>

          {hasFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3">
              <p className="text-sm text-zinc-600">
                Showing {tasks.length} result{tasks.length === 1 ? '' : 's'} for the current filters.
              </p>
              <button
                type="button"
                onClick={() => setSearchParams(view === 'board' ? {} : { view })}
                className="rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {(error || actionError) && (
          <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error || actionError}
          </div>
        )}

        {view === 'board' ? (
          <TaskBoard
            tasks={tasks}
            loading={loading}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
        ) : (
          <TaskTable
            tasks={tasks}
            loading={loading}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-zinc-950/30 px-4 py-8">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-task-title"
            className="w-full max-w-xl rounded-lg border border-zinc-200 bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-cyan-700">Task</p>
                <h2 id="new-task-title" className="text-xl font-bold text-zinc-950">Create a new task</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
            <TaskForm onSubmit={handleCreateTask} busy={createBusy} />
          </section>
        </div>
      )}

      <AssistantPanel onTasksChanged={refetch} />
    </div>
  );
};

interface MetricProps {
  label: string;
  value: number;
  tone: 'cyan' | 'amber' | 'emerald' | 'rose';
  icon: typeof ClipboardList;
}

const Metric = ({ label, value, tone, icon: Icon }: MetricProps) => {
  const toneClass = {
    cyan: 'bg-cyan-50 text-cyan-800 border-cyan-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    rose: 'bg-rose-50 text-rose-800 border-rose-100',
  }[tone];

  return (
    <div className={`rounded-lg border px-4 py-4 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{label}</p>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="mt-2 text-3xl font-bold tracking-normal">{value}</p>
    </div>
  );
};

interface SelectFilterProps<Value extends string> {
  label: string;
  allLabel: string;
  value: Value;
  values: Value[];
  onChange: (value: Value) => void;
}

const SelectFilter = <Value extends string>({ label, allLabel, value, values, onChange }: SelectFilterProps<Value>) => (
  <label className="block min-w-44 text-sm font-semibold text-zinc-700">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as Value)}
      className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm font-normal focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"
    >
      {values.map((option) => (
        <option key={option} value={option}>
          {option === 'ALL' ? allLabel : formatEnumLabel(option)}
        </option>
      ))}
    </select>
  </label>
);

interface TaskSurfaceProps {
  tasks: Task[];
  loading: boolean;
  onUpdate: (taskId: string, taskData: UpdateTaskInput) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

const TaskBoard = ({ tasks, loading, onUpdate, onDelete }: TaskSurfaceProps) => {
  if (loading) {
    return <LoadingState label="Loading board..." />;
  }

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <section aria-label="Task board" className="grid gap-4 lg:grid-cols-3">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);

        return (
          <div key={status} className="min-h-80 rounded-lg border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <h2 className="text-sm font-bold text-zinc-900">{formatEnumLabel(status)}</h2>
              <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">
                {columnTasks.length}
              </span>
            </div>
            <div className="grid gap-3 p-3">
              {columnTasks.length === 0 ? (
                <p className="rounded border border-dashed border-zinc-300 px-3 py-6 text-center text-sm text-zinc-500">
                  No tasks here.
                </p>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
};

const TaskCard = ({ task, onUpdate, onDelete }: { task: Task } & Pick<TaskSurfaceProps, 'onUpdate' | 'onDelete'>) => (
  <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <Link to={`/tasks/${task.id}`} className="block truncate text-base font-bold text-zinc-950 hover:text-cyan-700">
          {task.title}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{task.description || 'No description yet.'}</p>
      </div>
      <PriorityBadge priority={task.priority} />
    </div>

    <div className="mt-4 flex flex-wrap items-center gap-2">
      {TASK_STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onUpdate(task.id, { status })}
          disabled={task.status === status}
          className={`rounded border px-2 py-1 text-xs font-semibold ${
            task.status === status
              ? 'border-zinc-950 bg-zinc-950 text-white'
              : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50'
          } disabled:cursor-default`}
        >
          {formatEnumLabel(status)}
        </button>
      ))}
    </div>

    <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-100 pt-3">
      <Link to={`/tasks/${task.id}`} className="text-sm font-semibold text-cyan-700 hover:text-cyan-900">
        Open details
      </Link>
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete
      </button>
    </div>
  </article>
);

const TaskTable = ({ tasks, loading, onUpdate, onDelete }: TaskSurfaceProps) => {
  if (loading) {
    return <LoadingState label="Loading tasks..." />;
  }

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <section aria-label="Task table" className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-bold uppercase tracking-normal text-zinc-500">
            <tr>
              <th scope="col" className="px-4 py-3">Task</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Priority</th>
              <th scope="col" className="px-4 py-3">Updated</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-zinc-50">
                <td className="max-w-md px-4 py-4">
                  <Link to={`/tasks/${task.id}`} className="font-bold text-zinc-950 hover:text-cyan-700">
                    {task.title}
                  </Link>
                  <p className="mt-1 truncate text-zinc-600">{task.description || 'No description yet.'}</p>
                </td>
                <td className="px-4 py-4">
                  <select
                    value={task.status}
                    onChange={(event) => onUpdate(task.id, { status: event.target.value as TaskStatus })}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  >
                    {TASK_STATUSES.map((status) => (
                      <option key={status} value={status}>{formatEnumLabel(status)}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-4">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-4 py-4 text-zinc-600">{formatShortDateTime(task.updatedAt)}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="rounded border border-cyan-200 px-3 py-2 font-semibold text-cyan-700 hover:bg-cyan-50"
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(task.id)}
                      className="rounded border border-red-200 px-3 py-2 font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  return (
    <span className={`shrink-0 rounded border px-2 py-1 text-xs font-bold ${priorityBadgeClass(priority)}`}>
      {formatEnumLabel(priority)}
    </span>
  );
};

const LoadingState = ({ label }: { label: string }) => (
  <div role="status" className="rounded-lg border border-zinc-200 bg-white px-4 py-12 text-center text-sm font-medium text-zinc-600">
    {label}
  </div>
);

const EmptyState = () => (
  <section className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-14 text-center">
    <ClipboardList className="mx-auto h-10 w-10 text-zinc-400" aria-hidden="true" />
    <h2 className="mt-3 text-lg font-bold text-zinc-950">No tasks match this view</h2>
    <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600">
      Create a task or loosen the filters to bring work back into the list.
    </p>
  </section>
);

const parseDashboardView = (value: string | null): DashboardView =>
  value === 'table' ? 'table' : 'board';

const parseStatusFilter = (value: string | null): StatusFilter =>
  value && TASK_STATUSES.includes(value as TaskStatus) ? (value as TaskStatus) : 'ALL';

const parsePriorityFilter = (value: string | null): PriorityFilter =>
  value && TASK_PRIORITIES.includes(value as TaskPriority) ? (value as TaskPriority) : 'ALL';

const messageForError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
};
