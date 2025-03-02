import { Hono } from 'hono';
import { user_router } from './routes/user';
import { project_router } from './routes/project';
import { getUserSessionMiddleware } from './context';

const router = new Hono()
  .use(getUserSessionMiddleware)
  .route('/user', user_router)
  .route('/project', project_router);

export const api_handler = new Hono().route('/hono', router);

export type Router = typeof router;
