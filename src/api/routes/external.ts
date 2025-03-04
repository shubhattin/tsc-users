import { Hono } from 'hono';
import { protectedRoute } from '../context';
import { db } from '~/db/db';
import { delay } from '~/tools/delay';
import { language, user_project_language_join } from '~/db/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const router = new Hono().get('/user_info_project', protectedRoute, async (c) => {
  const user_session_info = c.get('user')!;
  const user_param_id = z.string().parse(c.req.query('user_id'));
  const project_id = z.coerce.number().int().parse(c.req.query('project_id'));
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
          langugaes: {
            lang_id: number;
            lang_name: string;
          };
        }
    >({
      is_approved: false
    });
  }
  const langugaes = await db
    .select({
      lang_id: language.id,
      lang_name: language.name
    })
    .from(user_project_language_join)
    .where(
      and(
        eq(user_project_language_join.user_id, user_param_id),
        eq(user_project_language_join.project_id, project_id)
      )
    )
    .innerJoin(language, eq(user_project_language_join.language_id, language.id));

  return c.json({
    is_approved: true,
    langugaes
  });
});

export const external_router = router;
