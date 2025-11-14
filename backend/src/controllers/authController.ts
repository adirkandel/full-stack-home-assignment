import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const register = async (req: AuthRequest, res: Response) => {
  const { email, username, password, name } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username },
      ],
    },
  });

  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      name,
    },
  });

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    },
    token,
  });
};

export const login = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );

  res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    },
    token,
  });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

