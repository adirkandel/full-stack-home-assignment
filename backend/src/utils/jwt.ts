import jwt from 'jsonwebtoken';
import { env } from '../env';

type AuthTokenPayload = {
  userId: string;
};

export const signAuthToken = (userId: string): string => {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' });
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (typeof decoded === 'string' || typeof decoded.userId !== 'string' || decoded.userId.length === 0) {
    throw new Error('Invalid auth token payload');
  }

  return { userId: decoded.userId };
};
