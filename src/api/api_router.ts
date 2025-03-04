import { Hono } from 'hono';
import { user_router } from './routes/user';
import { project_router } from './routes/project';
import { getUserSessionMiddleware } from './context';
import { external_router } from './routes/external';

const router = new Hono()
  .use(getUserSessionMiddleware)
  .route('/user', user_router)
  .route('/project', project_router)
  .route('/ext', external_router);

export const api_handler = new Hono().route('/api', router);

export type Router = typeof router;
