import { Hono } from 'hono';
import { protectedRoute } from '../context';

const router = new Hono().get('/user', protectedRoute, async (c) => {
  const user = c.get('user');
  console.log(user?.name);
  return c.json({
    name: 'test'
  });
});

export const user_router = router;
