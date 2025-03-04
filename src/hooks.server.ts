import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/auth'; // path to your auth file
import { svelteKitHandler } from 'better-auth/svelte-kit';

export const handle: Handle = async ({ event, resolve }) => {
  // return resolve(event);
  if (event.url.pathname.startsWith('/api') || event.url.pathname.startsWith('/hono')) {
    // Required for CORS to work
    if (event.request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Origin': 'http://localhost:5173',
          // Explicitly list content-type and other common headers
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    }
  }
  const res: Response = await svelteKitHandler({ event, resolve, auth });
  if (event.url.pathname.startsWith('/api') || event.url.pathname.startsWith('/hono')) {
    res.headers.append('Access-Control-Allow-Origin', `http://localhost:5173`);
    res.headers.append('Access-Control-Allow-Credentials', 'true');
  }
  return res;
};

// buffer pollyfill for netlify
import { Buffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
