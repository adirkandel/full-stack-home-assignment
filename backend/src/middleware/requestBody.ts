import express from 'express';
import {
  REQUEST_BODY_LIMIT,
  REQUEST_BODY_MALFORMED_JSON_ERROR,
  REQUEST_BODY_TOO_LARGE_ERROR,
} from '../constants/requestBody';

interface BodyParserError extends Error {
  type?: string;
}

export const jsonBodyParser = express.json({ limit: REQUEST_BODY_LIMIT });

export const jsonBodyErrorHandler: express.ErrorRequestHandler = (error: BodyParserError, _req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: REQUEST_BODY_MALFORMED_JSON_ERROR });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: REQUEST_BODY_TOO_LARGE_ERROR });
  }

  next(error);
};
