import type { SearchResult } from '../types';

const BASE_URL = 'https://api.themoviedb.org/3';
const token = import.meta.env.VITE_TMDB_TOKEN as string;

export async function searchTitles(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const url = `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&language=es-AR&include_adult=false`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
    },
    signal,
  });

  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);

  const data = await res.json();
  // The API also returns people; we only want movies and series.
  return (data.results as SearchResult[]).filter(
    (r) => r.media_type === 'movie' || r.media_type === 'tv',
  );
}