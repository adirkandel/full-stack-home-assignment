import type { Prisma } from '@prisma/client';

export const idSelect = {
  id: true,
} as const;

export const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
} as const satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export const toPublicUser = (user: PublicUser): PublicUser => ({
  id: user.id,
  email: user.email,
  username: user.username,
  name: user.name,
});
