import { z } from 'zod';
import {
  user,
  account,
  language,
  project,
  user_project_join,
  user_project_language_join,
  user_info,
  verification
} from './schema';
import { createSelectSchema } from 'drizzle-zod';

export const UserSchemaZod = createSelectSchema(user, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});
export const AccountSchemaZod = createSelectSchema(account, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  accessTokenExpiresAt: z.coerce.date(),
  refreshTokenExpiresAt: z.coerce.date()
});
export const VerificationSchemaZod = createSelectSchema(verification, {
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  expiresAt: z.coerce.date()
});
export const ProjectSchemaZod = createSelectSchema(project);
export const LanguageSchemaZod = createSelectSchema(language);
export const UserProjectJoinSchemaZod = createSelectSchema(user_project_join);
export const UserProjectLanguageJoinSchemaZod = createSelectSchema(user_project_language_join);
export const UserInfoSchemaZod = createSelectSchema(user_info);
