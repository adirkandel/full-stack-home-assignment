import { randomBytes } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const placeholderJwtSecrets = new Set([
  'your-secret-key-change-in-production',
]);

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const createDevelopmentJwtSecret = (): string => {
  return randomBytes(32).toString('hex');
};

const getJwtSecret = (): string => {
  const value = process.env.JWT_SECRET?.trim() ?? '';

  if (value && !placeholderJwtSecrets.has(value)) {
    return value;
  }

  const isMissing = !value;
  const productionError = isMissing
    ? 'JWT_SECRET is required'
    : 'JWT_SECRET must be changed from the default placeholder value';
  const developmentWarning = isMissing
    ? 'JWT_SECRET is not set'
    : 'JWT_SECRET uses a default placeholder value';

  if (isProduction) {
    throw new Error(productionError);
  } else {
    console.warn(`${developmentWarning}; using an ephemeral development JWT secret`);
  }

  return createDevelopmentJwtSecret();
};

export const env = {
  isProduction,
  jwtSecret: getJwtSecret(),
  nodeEnv,
  port: process.env.PORT || 3000,
} as const;
