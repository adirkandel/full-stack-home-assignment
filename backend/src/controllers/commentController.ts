import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createComment = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { taskId, content } = req.body;

  const comment = await prisma.comment.create({
    data: {
      content,
      taskId,
      userId: userId!,
    },
  });

  res.status(201).json(comment);
};

export const getComments = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.query;

  const comments = await prisma.comment.findMany({
    where: {
      taskId: taskId as string,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  for (const comment of comments) {
    const user = await prisma.user.findUnique({
      where: { id: comment.userId },
    });
    (comment as any).user = user;
  }

  res.json(comments);
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
 const userId = req.userId;

    // Verify that the comment exists and belongs to the user
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (existingComment.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own comments' });
    }
  await prisma.comment.delete({
    where: { id },
  });

  res.status(204).send();
};

