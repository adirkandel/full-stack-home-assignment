import type { Prisma } from '@prisma/client';
import type { TransactionClient } from './prisma';
import { idSelect, publicUserSelect } from './selects';

type TaskQueryClient = Pick<TransactionClient, 'comment' | 'task'>;

export const taskListInclude = {
  assignments: {
    include: {
      user: {
        select: publicUserSelect,
      },
    },
  },
} as const satisfies Prisma.TaskInclude;

export const commentWithUserInclude = {
  user: {
    select: publicUserSelect,
  },
} as const satisfies Prisma.CommentInclude;

const commentOwnerSelect = {
  id: true,
  taskId: true,
} as const satisfies Prisma.CommentSelect;

export const taskDetailInclude = {
  assignments: {
    include: {
      user: {
        select: publicUserSelect,
      },
    },
  },
  comments: {
    include: commentWithUserInclude,
    orderBy: {
      createdAt: 'desc',
    },
  },
} as const satisfies Prisma.TaskInclude;

export const findTaskIdForUser = (client: TaskQueryClient, userId: string, taskId: string) =>
  client.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
    select: idSelect,
  });

export const taskExistsForUser = async (client: TaskQueryClient, userId: string, taskId: string) =>
  (await findTaskIdForUser(client, userId, taskId)) !== null;

export const findCommentForTaskOwner = (client: TaskQueryClient, userId: string, commentId: string) =>
  client.comment.findFirst({
    where: {
      id: commentId,
      task: {
        userId,
      },
    },
    select: commentOwnerSelect,
  });
