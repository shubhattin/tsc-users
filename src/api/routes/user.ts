import { Hono } from 'hono';
import { protectedRoute } from '../context';
import { db } from '~/db/db';
import { delay } from '~/tools/delay';
import { language, project, user_project_join, user_project_language_join } from '~/db/schema';
import { and, eq } from 'drizzle-orm';

const router = new Hono().get('/user_info', protectedRoute, async (c) => {
  const user_info = c.get('user')!;
  await delay(600);
  const is_approved = (
    await db.query.user_info.findFirst({
      columns: {
        is_approved: true
      },
      where: ({ id }, { eq }) => eq(id, user_info.id)
    })
  )?.is_approved;
  if (user_info.role !== 'user' || !is_approved)
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

  const projects_info = await db
    .select({
      project_id: project.id,
      project_name: project.name,
      project_description: project.description
    })
    .from(user_project_join)
    .where(eq(user_project_join.user_id, user_info.id))
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
            eq(user_project_language_join.user_id, user_info.id),
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
});

export const user_router = router;
