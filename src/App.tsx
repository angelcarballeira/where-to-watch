import { useEffect, useState } from 'react';
import { searchTitles } from './api/tmdb';
import type { SearchResult } from './types';

const IMG_URL = 'https://image.tmdb.org/t/p/w185';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        setResults(await searchTitles(trimmed, controller.signal));
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError('Something went wrong. Try again.');
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">Where to watch</h1>

        <input
          type="search"
          placeholder="Search a movie or series"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-transparent p-3 outline-none focus:border-blue-500 dark:border-gray-700"
        />

        {loading && <p className="mt-4 text-sm text-gray-500">Loading…</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
          {results.map((r) => {
            const main = r.title ?? r.name;
            const original = r.original_title ?? r.original_name;
            const date = r.release_date ?? r.first_air_date;
            return (
              <li key={`${r.media_type}-${r.id}`} className="flex gap-3 py-3">
                {r.poster_path ? (
                  <img
                    src={`${IMG_URL}${r.poster_path}`}
                    alt={main}
                    className="h-23 w-16 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-23 w-16 shrink-0 rounded-md bg-gray-200 dark:bg-gray-800" />
                )}
                <div>
                  <strong>{main}</strong>
                  {original && original !== main && (
                    <div className="text-sm text-gray-500">{original}</div>
                  )}
                  <div className="mt-1 text-xs text-gray-400">
                    {r.media_type === 'movie' ? 'Movie' : 'Series'}
                    {date && ` · ${date.slice(0, 4)}`}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}

export default App;