import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
} as const;

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { taskId, content } = req.body;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId,
      },
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { taskId } = req.query;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId as string,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comments = await prisma.comment.findMany({
      where: {
        taskId: taskId as string,
      },
      include: {
        user: {
          select: publicUserSelect,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const comment = await prisma.comment.findFirst({
      where: {
        id,
        task: {
          userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await prisma.comment.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
