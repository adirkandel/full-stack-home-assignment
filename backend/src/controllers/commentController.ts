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

  await prisma.comment.delete({
    where: { id },
  });

  res.status(204).send();
};

