import type { Handle } from '@sveltejs/kit';
import { auth, ALLOWRD_ORIGINS } from '$lib/auth'; // path to your auth file
import { svelteKitHandler } from 'better-auth/svelte-kit';

export const handle: Handle = async ({ event, resolve }) => {
  const origin = event.request.headers.get('origin');
  const isAllowedOrigin = !!origin && ALLOWRD_ORIGINS.includes(origin);

  const CORS_ALLOWED_URLS = ['/api/auth', '/api/ext'];
  const IS_CORS_ALLOWED_URL = CORS_ALLOWED_URLS.some((url) => event.url.pathname.startsWith(url));
  // Required for CORS to work
  if (IS_CORS_ALLOWED_URL && event.request.method === 'OPTIONS' && isAllowedOrigin) {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-Requested-With, X-Captcha-Response',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': origin,
        Vary: 'Origin'
      }
    });
  }
  const res: Response = await svelteKitHandler({ event, resolve, auth });
  if (IS_CORS_ALLOWED_URL && isAllowedOrigin) {
    res.headers.append('Access-Control-Allow-Origin', origin);
    res.headers.append('Access-Control-Allow-Credentials', 'true');
    res.headers.append('Vary', 'Origin');
  }
  return res;
};

// buffer pollyfill for netlify
import { Buffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
