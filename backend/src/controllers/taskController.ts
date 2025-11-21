import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { search, status } = req.query;

  const whereClause: any = {
    OR: [
      { userId },
      { assignments: { some: { userId } } }
    ],
    ...(status && { status: status as string }),
  };

  if (search) {
    whereClause.AND = [
      {
        OR: [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ],
      },
    ];
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
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
    },
  });

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
    const userId = req.userId;
    const { title, description, status, priority } = req.body;

    // Verify task ownership before update
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to update this task' });
    }

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
    const userId = req.userId;

    // Verify task ownership before deletion
     const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this task' });
    }

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
    const userId = req.userId;

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

    // Check if the user is the owner or an assignee of the task
    const isOwner = task.userId === userId;
    const isAssigned = task.assignments?.some(assignment => assignment.userId === userId);

    if (!isOwner && !isAssigned) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view this task' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};


export const assignUserToTask = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const { userId: assigneeUserId } = req.body;
  const ownerId = req.userId;

  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (task.userId !== ownerId) {
    return res.status(403).json({ error: 'Only task owner can assign users' });
  }

  const assignment = await prisma.taskAssignment.create({
    data: {
      taskId,
      userId: assigneeUserId,
    },
  });

  res.status(201).json(assignment);
};

export const unassignUserFromTask = async (req: AuthRequest, res: Response) => {
  const { taskId, userId } = req.params;
  const ownerId = req.userId;

  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task || task.userId !== ownerId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await prisma.taskAssignment.deleteMany({
    where: { taskId, userId },
  });

  res.status(204).send();
};

