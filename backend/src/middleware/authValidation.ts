import { NextFunction, Request, Response } from 'express';
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
} from '../constants/auth';
import { hasText, isString } from './validation';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as Record<string, unknown>;

  if (!hasText(body.email) || !isValidEmail(body.email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  if (!hasText(body.username) || body.username.trim().length > USERNAME_MAX_LENGTH) {
    return res.status(400).json({ error: `Username is required and must be ${USERNAME_MAX_LENGTH} characters or fewer` });
  }

  if (!hasText(body.password)) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const passwordLength = body.password.length;

  if (passwordLength < PASSWORD_MIN_LENGTH || passwordLength > PASSWORD_MAX_LENGTH) {
    return res.status(400).json({
      error: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`,
    });
  }

  if (body.name !== undefined && body.name !== null && !isString(body.name)) {
    return res.status(400).json({ error: 'Name must be a string or null' });
  }

  const normalizedName = isString(body.name) ? body.name.trim() : body.name;

  if (isString(normalizedName) && normalizedName.length > NAME_MAX_LENGTH) {
    return res.status(400).json({ error: `Name must be ${NAME_MAX_LENGTH} characters or fewer` });
  }

  req.body = {
    email: body.email.trim().toLowerCase(),
    username: body.username.trim(),
    password: body.password,
    name: normalizedName || null,
  };

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as Record<string, unknown>;

  if (!hasText(body.email) || !isValidEmail(body.email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  if (!hasText(body.password)) {
    return res.status(400).json({ error: 'Password is required' });
  }

  req.body = {
    email: body.email.trim().toLowerCase(),
    password: body.password,
  };

  next();
};

const isValidEmail = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length <= EMAIL_MAX_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};
