import { NextFunction, Request, Response } from 'express';
import { COMMENT_MAX_LENGTH } from '../constants/comment';
import { hasText, hasValue, isString } from './validation';

export const validateCommentListQuery = (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.query;

  if (!hasValue(taskId)) {
    return res.status(400).json({ error: 'taskId query parameter is required' });
  }

  if (!isString(taskId) || taskId.trim().length === 0) {
    return res.status(400).json({ error: 'taskId must be a single string' });
  }

  req.query.taskId = taskId.trim();
  next();
};

export const validateCreateComment = (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as Record<string, unknown>;

  if (!hasText(body.taskId)) {
    return res.status(400).json({ error: 'taskId is required' });
  }

  if (!hasText(body.content)) {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  if (body.content.trim().length > COMMENT_MAX_LENGTH) {
    return res.status(400).json({ error: `Comment content must be ${COMMENT_MAX_LENGTH} characters or fewer` });
  }

  req.body = {
    taskId: body.taskId.trim(),
    content: body.content.trim(),
  };

  next();
};
