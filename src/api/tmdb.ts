import type { AllProviders, Region, SearchResult } from '../types';

const BASE_URL = '/api/tmdb';

async function tmdbFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { accept: 'application/json' },
    signal,
  });
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function searchTitles(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const data = await tmdbFetch<{ results: SearchResult[] }>(
    `/search/multi?query=${encodeURIComponent(query)}&language=es-AR&include_adult=false`,
    signal,
  );
  return data.results.filter(
    (r) => r.media_type === 'movie' || r.media_type === 'tv',
  );
}

export async function getRegions(signal?: AbortSignal): Promise<Region[]> {
  const data = await tmdbFetch<{ results: Region[] }>(
    '/watch/providers/regions',
    signal,
  );
  return data.results;
}

export async function getWatchProviders(
  mediaType: 'movie' | 'tv',
  id: number,
  signal?: AbortSignal,
): Promise<AllProviders> {
  const data = await tmdbFetch<{ results: AllProviders }>(
    `/${mediaType}/${id}/watch/providers`,
    signal,
  );
  return data.results;
}