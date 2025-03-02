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
  .get('/list_projects', protectedAdminRoute, async (e) => {
    const projects = await db.query.project.findMany();
    return e.json(projects);
  })
  .get('/list_languages', protectedAdminRoute, async (e) => {
    const languages = await db.query.language.findMany();
    return e.json(languages);
  });

export const project_router = router;
