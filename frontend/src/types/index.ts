export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
}

type ValueOf<T> = T[keyof T];

export const TASK_STATUS = {
  Todo: 'TODO',
  InProgress: 'IN_PROGRESS',
  Done: 'DONE',
} as const;

export type TaskStatus = ValueOf<typeof TASK_STATUS>;

export const TASK_STATUSES: TaskStatus[] = Object.values(TASK_STATUS);

export const TASK_PRIORITY = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
} as const;

export type TaskPriority = ValueOf<typeof TASK_PRIORITY>;

export const TASK_PRIORITIES: TaskPriority[] = Object.values(TASK_PRIORITY);

export type TaskFilters = {
  search?: string;
  status?: TaskStatus;
};

export interface TaskEditableFields {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  assignments?: TaskAssignment[];
  comments?: Comment[];
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  user?: User;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export type AssistantMessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';
export type AssistantDraftStatus = 'PENDING' | 'EXECUTED' | 'DISCARDED' | 'FAILED';

interface AssistantDraftOperationBase {
  id: string;
  label: string;
}

export interface CreateTaskDraftOperation extends AssistantDraftOperationBase {
  type: 'create_task';
  input: CreateTaskInput;
}

export interface UpdateTaskDraftOperation extends AssistantDraftOperationBase {
  type: 'update_task';
  taskId: string;
  patch: UpdateTaskInput;
}

export interface DeleteTaskDraftOperation extends AssistantDraftOperationBase {
  type: 'delete_task';
  taskId: string;
}

export interface CreateCommentDraftOperation extends AssistantDraftOperationBase {
  type: 'create_comment';
  taskId: string;
  input: {
    content: string;
  };
}

export interface DeleteCommentDraftOperation extends AssistantDraftOperationBase {
  type: 'delete_comment';
  commentId: string;
}

export type AssistantDraftOperation =
  | CreateTaskDraftOperation
  | UpdateTaskDraftOperation
  | DeleteTaskDraftOperation
  | CreateCommentDraftOperation
  | DeleteCommentDraftOperation;

export interface AssistantDraftShape {
  schemaVersion: 1;
  summary: string;
  operations: AssistantDraftOperation[];
}

export interface AssistantExecutionResult {
  ok: boolean;
  operations: Array<{
    operationId: string;
    type: AssistantDraftOperation['type'];
    ok: boolean;
    entityId?: string;
    error?: string;
  }>;
}

export interface AssistantDraftRecord {
  id: string;
  status: AssistantDraftStatus;
  originalDraft: AssistantDraftShape;
  approvedDraft: AssistantDraftShape | null;
  executionResult: AssistantExecutionResult | null;
  createdAt: string;
  updatedAt: string;
  decidedAt: string | null;
  executedAt: string | null;
}

export interface AssistantMessage {
  id: string;
  sequence: number;
  role: AssistantMessageRole;
  content: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  draft?: AssistantDraftRecord | null;
}

export interface AssistantChatListItem {
  id: string;
  title: string | null;
  summary: string | null;
  lastMessagePreview: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export interface AssistantChat extends AssistantChatListItem {
  messages: AssistantMessage[];
}
