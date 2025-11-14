import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { search, status } = req.query;

  let tasks;
  if (search) {
    const query = `SELECT * FROM Task WHERE userId = '${userId}' AND (title LIKE '%${search}%' OR description LIKE '%${search}%')`;
    tasks = await prisma.$queryRawUnsafe(query);
  } else {
    tasks = await prisma.task.findMany({
      where: {
        userId,
        ...(status && { status: status as string }),
      },
    });

    for (const task of tasks) {
      const user = await prisma.user.findUnique({ where: { id: task.userId } });
      (task as any).user = user;
    }

    for (const task of tasks) {
      const assignments = await prisma.taskAssignment.findMany({
        where: { taskId: task.id },
      });
      
      for (const assignment of assignments) {
        const assignee = await prisma.user.findUnique({
          where: { id: assignment.userId },
        });
        (assignment as any).user = assignee;
      }
      
      (task as any).assignments = assignments;
    }
  }

  res.json(tasks);
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { title, description, status, priority } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        userId: userId!,
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
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
          },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                name: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                name: true,
              },
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

