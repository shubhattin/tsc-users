import { Hono } from 'hono';
import { protectedAdminRoute } from '../context';
import { db } from '~/db/db';
import { delay } from '~/tools/delay';
import { user_project_join, user_project_language_join } from '~/db/schema';
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
      await delay(400);
      await db.insert(user_project_join).values({
        user_id,
        project_id
      });

      return c.json({ success: true });
    }
  )
  .post(
    '/remove_from_project',
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
      await Promise.all([
        db
          .delete(user_project_join)
          .where(
            and(
              eq(user_project_join.user_id, user_id),
              eq(user_project_join.project_id, project_id)
            )
          ),
        // deleting the user project language assigned as well
        db
          .delete(user_project_language_join)
          .where(
            and(
              eq(user_project_language_join.user_id, user_id),
              eq(user_project_language_join.project_id, project_id)
            )
          )
      ]);

      return c.json({ success: true });
    }
  );

export const project_router = router;
