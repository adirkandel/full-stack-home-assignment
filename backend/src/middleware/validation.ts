import { NextFunction, Request, Response } from 'express';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const requireJsonObjectBody = (req: Request, res: Response, next: NextFunction) => {
  if (!isRecord(req.body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  next();
};

export const hasValue = (value: unknown) => value !== undefined && value !== null;

export const isString = (value: unknown): value is string =>
  typeof value === 'string';

export const hasText = (value: unknown): value is string =>
  isString(value) && value.trim().length > 0;

export const isOneOf = <Value extends string>(
  value: unknown,
  allowedValues: readonly Value[],
): value is Value =>
  isString(value) && allowedValues.includes(value as Value);

export const hasField = (body: Record<string, unknown>, fieldName: string) =>
  Object.prototype.hasOwnProperty.call(body, fieldName);

export const hasAnyField = (body: Record<string, unknown>, fieldNames: readonly string[]) =>
  fieldNames.some((fieldName) => hasField(body, fieldName));
