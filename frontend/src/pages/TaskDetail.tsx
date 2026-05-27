import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  MessageSquare,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react';
import { TaskForm } from '../components/TaskForm';
import { AssistantPanel } from '../components/AssistantPanel';
import { commentApi } from '../services/commentApi';
import { taskApi } from '../services/taskApi';
import { formatEnumLabel, formatFullDateTime } from '../utils/taskFormatting';
import type { Comment, Task, TaskEditableFields } from '../types';

export const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editableTask = useMemo<TaskEditableFields | null>(() => {
    if (!task) {
      return null;
    }

    return {
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
    };
  }, [task]);

  const loadTask = useCallback(async () => {
    if (!taskId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [taskResponse, commentsResponse] = await Promise.all([
        taskApi.getTask(taskId),
        commentApi.listComments(taskId),
      ]);

      setTask(taskResponse);
      setComments(commentsResponse);
    } catch (loadError) {
      setError(messageForError(loadError));
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void loadTask();
  }, [loadTask]);

  const handleSave = async (fields: TaskEditableFields) => {
    if (!taskId) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedTask = await taskApi.updateTask(taskId, fields);
      setTask(updatedTask);
      setEditing(false);
    } catch (saveError) {
      setError(messageForError(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!taskId || commentText.trim().length === 0) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const createdComment = await commentApi.createComment(taskId, commentText.trim());
      setComments((current) => [createdComment, ...current]);
      setCommentText('');
    } catch (commentError) {
      setError(messageForError(commentError));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setSaving(true);
    setError(null);

    try {
      await commentApi.deleteComment(commentId);
      setComments((current) => current.filter((comment) => comment.id !== commentId));
    } catch (deleteError) {
      setError(messageForError(deleteError));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskId) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await taskApi.deleteTask(taskId);
      navigate('/dashboard');
    } catch (deleteError) {
      setError(messageForError(deleteError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell onTasksChanged={loadTask}>
        <div role="status" className="rounded-lg border border-zinc-200 bg-white px-4 py-16 text-center text-sm font-medium text-zinc-600">
          Loading task detail...
        </div>
      </PageShell>
    );
  }

  if (!task) {
    return (
      <PageShell onTasksChanged={loadTask}>
        <section className="rounded-lg border border-zinc-200 bg-white px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-zinc-950">Task not found</h1>
          <p className="mt-2 text-sm text-zinc-600">{error || 'The task may have been removed.'}</p>
          <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 rounded bg-zinc-950 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to dashboard
          </Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell onTasksChanged={loadTask}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="grid gap-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-900">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back to dashboard
                </Link>
                <h1 className="mt-3 break-words text-3xl font-bold tracking-normal text-zinc-950">{task.title}</h1>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
                  {task.description || 'No description yet.'}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEditing((current) => !current)}
                  className="inline-flex items-center gap-2 rounded border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  {editing ? 'Close Edit' : 'Edit'}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {error}
              </div>
            )}
          </div>

          {editing && editableTask && (
            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" aria-labelledby="edit-task-title">
              <h2 id="edit-task-title" className="mb-4 text-lg font-bold text-zinc-950">Edit task fields</h2>
              <TaskForm
                initialValues={editableTask}
                onSubmit={handleSave}
                submitLabel="Save changes"
                busy={saving}
              />
            </section>
          )}

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" aria-labelledby="comments-title">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-cyan-700">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  Comments
                </p>
                <h2 id="comments-title" className="text-xl font-bold text-zinc-950">
                  Discussion ({comments.length})
                </h2>
              </div>
            </div>

            <form onSubmit={handleAddComment} className="mb-5 grid gap-3">
              <label htmlFor="comment-content" className="text-sm font-semibold text-zinc-700">
                Add comment
              </label>
              <textarea
                id="comment-content"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                rows={4}
                placeholder="Add context, decisions, blockers, or handoff notes."
                className="w-full resize-none rounded border border-zinc-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving || commentText.trim().length === 0}
                  className="rounded bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  Add Comment
                </button>
              </div>
            </form>

            <div className="grid gap-3">
              {comments.length === 0 ? (
                <p className="rounded border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500">
                  No comments yet.
                </p>
              ) : (
                comments.map((comment) => (
                  <article key={comment.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-white text-zinc-700">
                          <UserRound className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-zinc-950">
                            {comment.user?.name || comment.user?.username || 'Unknown user'}
                          </p>
                          <p className="text-xs text-zinc-500">{formatFullDateTime(comment.createdAt)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={saving}
                        className="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">{comment.content}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>

        <aside className="grid h-max gap-4">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" aria-labelledby="task-properties-title">
            <h2 id="task-properties-title" className="text-lg font-bold text-zinc-950">Task properties</h2>
            <dl className="mt-4 grid gap-4 text-sm">
              <Property label="Status" value={formatEnumLabel(task.status)} icon={CheckCircle2} />
              <Property label="Priority" value={formatEnumLabel(task.priority)} icon={Pencil} />
              <Property label="Created" value={formatFullDateTime(task.createdAt)} icon={CalendarClock} />
              <Property label="Updated" value={formatFullDateTime(task.updatedAt)} icon={CalendarClock} />
            </dl>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" aria-labelledby="assignments-title">
            <h2 id="assignments-title" className="text-lg font-bold text-zinc-950">Assignments</h2>
            <div className="mt-4 grid gap-2">
              {task.assignments && task.assignments.length > 0 ? (
                task.assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center gap-2 rounded border border-zinc-200 px-3 py-2">
                    <UserRound className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                    <span className="text-sm font-medium text-zinc-700">
                      {assignment.user?.name || assignment.user?.username || assignment.userId}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded border border-dashed border-zinc-300 px-3 py-6 text-center text-sm text-zinc-500">
                  No assignees yet.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </PageShell>
  );
};

const PageShell = ({
  children,
  onTasksChanged,
}: {
  children: ReactNode;
  onTasksChanged: () => Promise<void> | void;
}) => (
  <div className="min-h-screen bg-zinc-50 text-zinc-950">
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-cyan-700">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
        <Link to="/assistant" className="rounded border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-100">
          Open assistant
        </Link>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    <AssistantPanel onTasksChanged={onTasksChanged} />
  </div>
);

interface PropertyProps {
  label: string;
  value: string;
  icon: typeof CheckCircle2;
}

const Property = ({ label, value, icon: Icon }: PropertyProps) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-600">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
    <div>
      <dt className="font-semibold text-zinc-500">{label}</dt>
      <dd className="font-bold text-zinc-950">{value}</dd>
    </div>
  </div>
);

const messageForError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
};
