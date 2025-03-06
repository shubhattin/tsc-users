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
  const is_approved = user_session_info.is_approved;
  if (!is_approved)
    return c.json({
      languages: []
    });
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
    langugaes
  });
});

export const external_router = router;
