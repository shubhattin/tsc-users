import { z } from 'zod';
import {
  user,
  account,
  language,
  project,
  user_project_join,
  user_project_language_join,
  verification
} from './schema';
import { createSelectSchema } from 'drizzle-zod';

export const UserSchemaZod = createSelectSchema(user, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  banExpires: z.coerce.date().nullable()
});
export const AccountSchemaZod = createSelectSchema(account, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  accessTokenExpiresAt: z.coerce.date().nullable(),
  refreshTokenExpiresAt: z.coerce.date().nullable()
});
export const VerificationSchemaZod = createSelectSchema(verification, {
  createdAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date().nullable(),
  expiresAt: z.coerce.date()
});
export const ProjectSchemaZod = createSelectSchema(project);
export const LanguageSchemaZod = createSelectSchema(language);
export const UserProjectJoinSchemaZod = createSelectSchema(user_project_join);
export const UserProjectLanguageJoinSchemaZod = createSelectSchema(user_project_language_join);
