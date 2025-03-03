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
  .get('/user_info/:id', protectedRoute, async (c) => {
    const user_session_info = c.get('user')!;
    const user_param_id = c.req.param('id');
    await delay(550);
    const is_approved = (
      await db.query.user_info.findFirst({
        columns: {
          is_approved: true
        },
        where: ({ id }, { eq }) => eq(id, user_param_id)
      })
    )?.is_approved;
    if (
      (user_session_info.role !== 'admin' && user_session_info.id !== user_param_id) ||
      !is_approved
    ) {
      return c.json<
        | { is_approved: false }
        | {
            is_approved: true;
            projects: {
              project_id: number;
              project_name: string;
              project_description: string | null;
              langugaes: {
                lang_id: number;
                lang_name: string;
              }[];
            }[];
          }
      >({
        is_approved: false
      });
    }

    const projects_info = await db
      .select({
        project_id: project.id,
        project_name: project.name,
        project_description: project.description
      })
      .from(user_project_join)
      .where(eq(user_project_join.user_id, user_param_id))
      .innerJoin(project, eq(user_project_join.project_id, project.id));

    const projects = await Promise.all(
      projects_info.map(async (project_info) => {
        const langugaes = await db
          .select({
            lang_id: language.id,
            lang_name: language.name
          })
          .from(user_project_language_join)
          .where(
            and(
              eq(user_project_language_join.user_id, user_param_id),
              eq(user_project_language_join.project_id, project_info.project_id)
            )
          )
          .innerJoin(language, eq(user_project_language_join.language_id, language.id));
        return {
          ...project_info,
          langugaes
        };
      })
    );
    return c.json({
      is_approved: true,
      projects
    });
  })
  .get('/list_users', protectedAdminRoute, async (c) => {
    const user_session_info = c.get('user')!;
    await delay(550);
    const users = await db.query.user.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      with: {
        user_info: {
          columns: {
            is_approved: true
          }
        }
      },
      where: ({ id }, { ne }) => ne(id, user_session_info.id)
    });
    return c.json(users);
  })
  .post('/approve/:id', protectedAdminRoute, async (c) => {
    const user_id = c.req.param('id');
    const user_exists = await db.query.user_info.findFirst({
      where: ({ id }, { eq }) => eq(id, user_id)
    });
    if (user_exists) {
      await db.update(user_info).set({ is_approved: true }).where(eq(user_info.id, user_id));
    } else {
      await db.insert(user_info).values({
        id: user_id,
        is_approved: true
      });
    }
    return c.json({ success: true });
  })
  .post('/remove/:id', protectedAdminRoute, async (c) => {
    const user_id = c.req.param('id');
    await db.delete(user).where(eq(user.id, user_id));

    return c.json({ success: true });
  })
  .post(
    '/edit_name',
    protectedRoute,
    zValidator('json', z.object({ name: z.string() })),
    async (c) => {
      const user_info = c.get('user')!;
      const { name } = c.req.valid('json');
      await db.update(user).set({ name }).where(eq(user.id, user_info.id));
      return c.json({ success: true });
    }
  );

export const user_router = router;
