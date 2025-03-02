import { Hono } from 'hono';
import { protectedAdminRoute, protectedRoute } from '../context';
import { db } from '~/db/db';
import { delay } from '~/tools/delay';
import {
  language,
  project,
  user,
  user_info,
  user_project_join,
  user_project_language_join
} from '~/db/schema';
import { and, eq } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const router = new Hono()
  .get('/list_projects', protectedAdminRoute, async (c) => {
    const projects = await db.query.project.findMany();
    return c.json(projects);
  })
  .get('/list_languages', protectedAdminRoute, async (c) => {
    const languages = await db.query.language.findMany();
    return c.json(languages);
  })
  .post(
    '/add_to_project',
    protectedAdminRoute,
    zValidator(
      'json',
      z.object({
        user_id: z.string(),
        project_id: z.number().int()
      })
    ),
    async (c) => {
      const { user_id, project_id } = c.req.valid('json');
      await db.insert(user_project_join).values({
        user_id,
        project_id
      });

      return c.json({ success: true });
    }
  );

export const project_router = router;
