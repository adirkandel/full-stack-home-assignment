import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAssistantChat } from '../hooks/useAssistantChat';
import { assistantApi } from '../services/assistantApi';
import {
  TASK_PRIORITIES,
  TASK_PRIORITY,
  TASK_STATUSES,
  TASK_STATUS,
  type AssistantChat,
  type AssistantChatListItem,
  type AssistantDraftOperation,
  type AssistantDraftRecord,
  type AssistantDraftShape,
  type AssistantMessage,
  type CreateTaskInput,
  type UpdateTaskInput,
} from '../types';

interface AssistantPanelProps {
  onTasksChanged: () => Promise<void> | void;
}

export const AssistantPanel = ({ onTasksChanged }: AssistantPanelProps) => {
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const {
    chats,
    chat,
    loading,
    sending,
    input,
    error,
    pendingDraft,
    setInput,
    loadInitialChat,
    selectChat,
    startFreshChat,
    sendMessage,
    handleDraftExecuted,
    handleDraftDiscarded,
  } = useAssistantChat({ onTasksChanged });

  useEffect(() => {
    if (open) {
      void loadInitialChat();
    }
  }, [open, loadInitialChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat?.messages.length, sending]);

  const handleSelectChat = async (chatId: string) => {
    await selectChat(chatId);
    setHistoryOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-50 h-16 w-16 rounded-full border-4 border-white bg-cyan-600 text-white shadow-xl shadow-cyan-900/25 transition hover:-translate-y-1 hover:bg-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-300"
          aria-label="Open task assistant"
          aria-controls="task-assistant-panel"
          aria-expanded={open}
        >
          <span className="block text-lg font-black tracking-normal">AI</span>
          <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-lime-400" />
        </button>
      )}

      {open && (
        <section
          id="task-assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="task-assistant-title"
          className="fixed bottom-4 left-4 z-50 flex h-[min(44rem,calc(100vh-2rem))] w-[min(58rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl"
        >
          {historyOpen && (
            <aside className="hidden w-72 shrink-0 border-r border-gray-200 bg-gray-50 md:block">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Old chats</h3>
                <button
                  type="button"
                  onClick={() => {
                    void startFreshChat();
                    setHistoryOpen(false);
                  }}
                  className="rounded border border-cyan-200 px-2 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"
                >
                  Clean new chat
                </button>
              </div>
              <ChatHistory chats={chats} activeChatId={chat?.id ?? null} onSelect={handleSelectChat} />
            </aside>
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-normal text-cyan-700">Task assistant</p>
                <h2 id="task-assistant-title" className="truncate text-base font-bold text-gray-900">
                  {chat?.title || 'New chat'}
                </h2>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHistoryOpen((current) => !current)}
                  className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  aria-controls="task-assistant-history"
                  aria-expanded={historyOpen}
                >
                  History
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void startFreshChat();
                    setHistoryOpen(false);
                  }}
                  className="rounded border border-cyan-200 px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
                >
                  Clean new chat
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  aria-label="Close task assistant"
                >
                  Close
                </button>
              </div>
            </header>

            {historyOpen && (
              <div id="task-assistant-history" className="border-b border-gray-200 bg-gray-50 md:hidden">
                <ChatHistory chats={chats} activeChatId={chat?.id ?? null} onSelect={handleSelectChat} />
              </div>
            )}

            <main
              className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-4"
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
              aria-busy={loading || sending}
            >
              {loading && (
                <div role="status" className="text-sm text-gray-600">
                  Loading assistant...
                </div>
              )}

              {!loading && (!chat || chat.messages.length === 0) && <WelcomeMessage />}

              {!loading && chat?.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onExecuted={handleDraftExecuted}
                  onDiscarded={handleDraftDiscarded}
                />
              ))}

              {sending && (
                <div role="status" className="mt-3 max-w-[80%] rounded-lg bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
                  Drafting a careful answer...
                </div>
              )}

              <div ref={messagesEndRef} />
            </main>

            {error && (
              <div role="alert" className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-3">
              {pendingDraft && (
                <p id="task-assistant-pending-draft" className="mb-2 text-xs font-medium text-amber-700">
                  Resolve the pending draft before sending another message.
                </p>
              )}
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={sending || Boolean(pendingDraft)}
                  aria-label="Message task assistant"
                  aria-describedby={pendingDraft ? 'task-assistant-pending-draft' : undefined}
                  placeholder="Ask me to find, create, update, or delete tasks..."
                  className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={sending || Boolean(pendingDraft) || input.trim().length === 0}
                  className="rounded bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </>
  );
};

export const WelcomeMessage = () => (
  <div className="rounded-lg border border-cyan-100 bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
    <h3 className="mb-2 text-base font-bold text-gray-900">What can I do?</h3>
    <p>
      I can find tasks, summarize comments, draft new tasks, patch existing tasks, and prepare deletes for approval.
      Writes always appear as an editable draft first.
    </p>
  </div>
);

interface ChatHistoryProps {
  chats: AssistantChatListItem[];
  activeChatId: string | null;
  onSelect: (chatId: string) => Promise<void>;
}

export const ChatHistory = ({ chats, activeChatId, onSelect }: ChatHistoryProps) => {
  const groupedChats = groupChatsByDate(chats);

  if (chats.length === 0) {
    return (
      <div role="status" className="p-4 text-sm text-gray-500">
        No saved chats yet.
      </div>
    );
  }

  return (
    <nav aria-label="Assistant chat history" className="max-h-80 overflow-y-auto p-2 md:max-h-none">
      {groupedChats.map((group) => (
        <div key={group.label} className="mb-3">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-normal text-gray-500">{group.label}</p>
          <div className="space-y-1">
            {group.chats.map((chat) => (
              <button
                type="button"
                key={chat.id}
                onClick={() => void onSelect(chat.id)}
                aria-current={chat.id === activeChatId ? 'true' : undefined}
                className={`w-full rounded px-3 py-2 text-left text-sm transition ${
                  chat.id === activeChatId
                    ? 'bg-cyan-100 text-cyan-950'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="block truncate font-semibold">{chat.title || 'New chat'}</span>
                <span className="block truncate text-xs text-gray-500">
                  {chat.lastMessagePreview || 'No messages yet'}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
};

interface MessageBubbleProps {
  message: AssistantMessage;
  onExecuted: (chat: AssistantChat) => Promise<void>;
  onDiscarded: (chat: AssistantChat) => Promise<void>;
}

export const MessageBubble = ({ message, onExecuted, onDiscarded }: MessageBubbleProps) => {
  const isUser = message.role === 'USER';

  return (
    <article
      aria-label={isUser ? 'User message' : 'Assistant message'}
      className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[86%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-lg px-4 py-3 text-sm shadow-sm ${
            isUser
              ? 'bg-cyan-700 text-white'
              : 'border border-gray-200 bg-white text-gray-800'
          }`}
        >
          {message.content}
        </div>
        {message.draft && (
          <DraftCard draftRecord={message.draft} onExecuted={onExecuted} onDiscarded={onDiscarded} />
        )}
      </div>
    </article>
  );
};

interface DraftCardProps {
  draftRecord: AssistantDraftRecord;
  onExecuted: (chat: AssistantChat) => Promise<void>;
  onDiscarded: (chat: AssistantChat) => Promise<void>;
}

const DraftCard = ({ draftRecord, onExecuted, onDiscarded }: DraftCardProps) => {
  const [draft, setDraft] = useState<AssistantDraftShape>(
    draftRecord.approvedDraft ?? draftRecord.originalDraft,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPending = draftRecord.status === 'PENDING';
  const containsDelete = draft.operations.some(
    (operation) => operation.type === 'delete_task' || operation.type === 'delete_comment',
  );

  useEffect(() => {
    setDraft(draftRecord.approvedDraft ?? draftRecord.originalDraft);
  }, [draftRecord.id, draftRecord.approvedDraft, draftRecord.originalDraft]);

  const updateOperation = (
    operationId: string,
    updater: (operation: AssistantDraftOperation) => AssistantDraftOperation,
  ) => {
    setDraft((current) => ({
      ...current,
      operations: current.operations.map((operation) =>
        operation.id === operationId ? updater(operation) : operation,
      ),
    }));
  };

  const execute = async () => {
    setBusy(true);
    setError(null);

    try {
      const response = await assistantApi.executeDraft(draftRecord.id, draft);
      await onExecuted(response.chat);
    } catch (executeError) {
      setError(messageForError(executeError));
    } finally {
      setBusy(false);
    }
  };

  const discard = async () => {
    setBusy(true);
    setError(null);

    try {
      const response = await assistantApi.discardDraft(draftRecord.id);
      await onDiscarded(response.chat);
    } catch (discardError) {
      setError(messageForError(discardError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-label={`Assistant draft: ${draft.summary}`}
      className="mt-2 rounded-lg border border-cyan-100 bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-cyan-700">
            Draft {draftRecord.status.toLowerCase()}
          </p>
          <h4 className="text-sm font-bold text-gray-900">{draft.summary}</h4>
        </div>
        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
          {draft.operations.length} op{draft.operations.length === 1 ? '' : 's'}
        </span>
      </div>

      {containsDelete && isPending && (
        <div role="alert" className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          This draft includes a delete operation. Review the target carefully before approving.
        </div>
      )}

      <div className="space-y-3">
        {draft.operations.map((operation) => (
          <DraftOperationForm
            key={operation.id}
            operation={operation}
            disabled={!isPending || busy}
            onChange={(updatedOperation) => updateOperation(operation.id, () => updatedOperation)}
          />
        ))}
      </div>

      {draftRecord.executionResult && (
        <div className="mt-3 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
          {draftRecord.executionResult.ok ? 'Executed successfully.' : 'Execution failed.'}
        </div>
      )}

      {error && <div role="alert" className="mt-3 text-sm text-red-700">{error}</div>}

      {isPending && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={discard}
            disabled={busy}
            className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={execute}
            disabled={busy}
            aria-label={containsDelete ? 'Delete Task' : 'Apply Draft'}
            className={`rounded px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
              containsDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {containsDelete ? 'Delete Task' : 'Apply Draft'}
          </button>
        </div>
      )}
    </section>
  );
};

interface DraftOperationFormProps {
  operation: AssistantDraftOperation;
  disabled: boolean;
  onChange: (operation: AssistantDraftOperation) => void;
}

const DraftOperationForm = ({ operation, disabled, onChange }: DraftOperationFormProps) => (
  <div className="rounded border border-gray-200 bg-gray-50 p-3">
    <div className="mb-3 flex items-center justify-between gap-2">
      <p className="text-sm font-semibold text-gray-900">{operation.label}</p>
      <span className="rounded bg-white px-2 py-1 text-xs text-gray-600">{operation.type}</span>
    </div>
    {renderOperationFields(operation, disabled, onChange)}
  </div>
);

const renderOperationFields = (
  operation: AssistantDraftOperation,
  disabled: boolean,
  onChange: (operation: AssistantDraftOperation) => void,
) => {
  switch (operation.type) {
    case 'create_task':
      return (
        <TaskFields
          input={operation.input}
          disabled={disabled}
          onChange={(input) => onChange({ ...operation, input })}
        />
      );

    case 'update_task':
      return (
        <div className="space-y-3">
          <TextInput
            label="Task id"
            value={operation.taskId}
            disabled={disabled}
            onChange={(taskId) => onChange({ ...operation, taskId })}
          />
          <TaskPatchFields
            patch={operation.patch}
            disabled={disabled}
            onChange={(patch) => onChange({ ...operation, patch })}
          />
        </div>
      );

    case 'delete_task':
      return (
        <div className="space-y-3">
          <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            This will delete the selected task after approval.
          </p>
          <TextInput
            label="Task id"
            value={operation.taskId}
            disabled={disabled}
            onChange={(taskId) => onChange({ ...operation, taskId })}
          />
        </div>
      );

    case 'create_comment':
      return (
        <div className="space-y-3">
          <TextInput
            label="Task id"
            value={operation.taskId}
            disabled={disabled}
            onChange={(taskId) => onChange({ ...operation, taskId })}
          />
          <TextareaInput
            label="Comment"
            value={operation.input.content}
            disabled={disabled}
            onChange={(content) => onChange({ ...operation, input: { content } })}
          />
        </div>
      );

    case 'delete_comment':
      return (
        <div className="space-y-3">
          <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            This will delete the selected comment after approval.
          </p>
          <TextInput
            label="Comment id"
            value={operation.commentId}
            disabled={disabled}
            onChange={(commentId) => onChange({ ...operation, commentId })}
          />
        </div>
      );
  }
};

interface TaskFieldsProps {
  input: CreateTaskInput;
  disabled: boolean;
  onChange: (input: CreateTaskInput) => void;
}

const TaskFields = ({ input, disabled, onChange }: TaskFieldsProps) => (
  <div className="grid gap-3">
    <TextInput
      label="Title"
      value={input.title}
      disabled={disabled}
      onChange={(title) => onChange({ ...input, title })}
    />
    <TextareaInput
      label="Description"
      value={input.description ?? ''}
      disabled={disabled}
      onChange={(description) => onChange({ ...input, description })}
    />
    <div className="grid grid-cols-2 gap-3">
      <SelectInput
        label="Status"
        value={input.status ?? TASK_STATUS.Todo}
        values={TASK_STATUSES}
        disabled={disabled}
        onChange={(status) => onChange({ ...input, status })}
      />
      <SelectInput
        label="Priority"
        value={input.priority ?? TASK_PRIORITY.Medium}
        values={TASK_PRIORITIES}
        disabled={disabled}
        onChange={(priority) => onChange({ ...input, priority })}
      />
    </div>
  </div>
);

interface TaskPatchFieldsProps {
  patch: UpdateTaskInput;
  disabled: boolean;
  onChange: (patch: UpdateTaskInput) => void;
}

const TaskPatchFields = ({ patch, disabled, onChange }: TaskPatchFieldsProps) => (
  <div className="grid gap-3">
    {'title' in patch && (
      <TextInput
        label="Title"
        value={patch.title ?? ''}
        disabled={disabled}
        onChange={(title) => onChange({ ...patch, title })}
      />
    )}
    {'description' in patch && (
      <TextareaInput
        label="Description"
        value={patch.description ?? ''}
        disabled={disabled}
        onChange={(description) => onChange({ ...patch, description })}
      />
    )}
    <div className="grid grid-cols-2 gap-3">
      {'status' in patch && (
        <SelectInput
          label="Status"
          value={patch.status ?? TASK_STATUS.Todo}
          values={TASK_STATUSES}
          disabled={disabled}
          onChange={(status) => onChange({ ...patch, status })}
        />
      )}
      {'priority' in patch && (
        <SelectInput
          label="Priority"
          value={patch.priority ?? TASK_PRIORITY.Medium}
          values={TASK_PRIORITIES}
          disabled={disabled}
          onChange={(priority) => onChange({ ...patch, priority })}
        />
      )}
    </div>
  </div>
);

interface TextInputProps {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

const TextInput = ({ label, value, disabled, onChange }: TextInputProps) => (
  <label className="block text-xs font-semibold text-gray-700">
    {label}
    <input
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:bg-gray-100"
    />
  </label>
);

const TextareaInput = ({ label, value, disabled, onChange }: TextInputProps) => (
  <label className="block text-xs font-semibold text-gray-700">
    {label}
    <textarea
      value={value}
      disabled={disabled}
      rows={3}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 w-full resize-none rounded border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:bg-gray-100"
    />
  </label>
);

interface SelectInputProps<Value extends string> {
  label: string;
  value: Value;
  values: Value[];
  disabled: boolean;
  onChange: (value: Value) => void;
}

const SelectInput = <Value extends string>({
  label,
  value,
  values,
  disabled,
  onChange,
}: SelectInputProps<Value>) => (
  <label className="block text-xs font-semibold text-gray-700">
    {label}
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as Value)}
      className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:bg-gray-100"
    >
      {values.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

const groupChatsByDate = (chats: AssistantChatListItem[]) => {
  const now = new Date();
  const today = now.toDateString();
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterday = yesterdayDate.toDateString();

  const groups: Array<{ label: string; chats: AssistantChatListItem[] }> = [
    { label: 'Today', chats: [] },
    { label: 'Yesterday', chats: [] },
    { label: 'Earlier', chats: [] },
  ];

  for (const chat of chats) {
    const date = new Date(chat.lastMessageAt).toDateString();

    if (date === today) {
      groups[0].chats.push(chat);
    } else if (date === yesterday) {
      groups[1].chats.push(chat);
    } else {
      groups[2].chats.push(chat);
    }
  }

  return groups.filter((group) => group.chats.length > 0);
};

const messageForError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
};
