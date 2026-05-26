import { Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { isString } from '../middleware/validation';

const prisma = new PrismaClient();

const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
} as const;

const taskListInclude = {
  assignments: {
    include: {
      user: {
        select: publicUserSelect,
      },
    },
  },
} as const;

const isRecordNotFoundError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const search = isString(req.query.search) ? req.query.search.trim() : undefined;
    const status = isString(req.query.status) ? req.query.status : undefined;

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        ...(status && { status }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: taskListInclude,
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { title, description, status, priority } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        userId,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    const task = await prisma.task.update({
      where: {
        id,
        userId,
      },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
      },
      include: taskListInclude,
    });

    res.json(task);
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return res.status(404).json({ error: 'Task not found' });
    }

    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    await prisma.task.delete({
      where: {
        id,
        userId,
      },
    });

    res.status(204).send();
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return res.status(404).json({ error: 'Task not found' });
    }

    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        assignments: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
        },
        comments: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};
