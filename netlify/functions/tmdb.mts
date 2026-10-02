import type { Config } from '@netlify/functions';

// Only these TMDB paths are allowed, so nobody can use your token for anything else.
const ALLOWED = [
  /^\/search\/multi$/,
  /^\/watch\/providers\/regions$/,
  /^\/(movie|tv)\/\d+\/watch\/providers$/,
];

export default async (req: Request) => {
  const url = new URL(req.url);
  const tmdbPath = url.pathname.replace(/^\/api\/tmdb/, '');

  if (!ALLOWED.some((re) => re.test(tmdbPath))) {
    return new Response('Not found', { status: 404 });
  }

  const token = Netlify.env.get('TMDB_TOKEN');
  if (!token) {
    return new Response('Server is missing TMDB_TOKEN', { status: 500 });
  }

  const upstream = await fetch(
    `https://api.themoviedb.org/3${tmdbPath}${url.search}`,
    { headers: { Authorization: `Bearer ${token}`, accept: 'application/json' } },
  );

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=300',
    },
  });
};

export const config: Config = { path: '/api/tmdb/*' };