import { useEffect, useState } from 'react';
import { getRegions, searchTitles } from './api/tmdb';
import CountrySelect from './components/CountrySelect';
import ProviderList from './components/ProviderList';
import type { Region, SearchResult } from './types';

const IMG_URL = 'https://image.tmdb.org/t/p/w185';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [regions, setRegions] = useState<Region[]>([]);
  const [country, setCountry] = useState(
    () => localStorage.getItem('country') ?? 'AR',
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    getRegions().then(setRegions).catch(() => setRegions([]));
  }, []);

  useEffect(() => {
    localStorage.setItem('country', country);
  }, [country]);

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
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">¿Dónde ver?</h1>
          {regions.length > 0 && (
            <CountrySelect
              regions={regions}
              value={country}
              onChange={setCountry}
            />
          )}
        </div>

        <input
          type="search"
          placeholder="Busca una película o serie"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-transparent p-3 outline-none focus:border-blue-500 dark:border-gray-700"
        />

        {loading && <p className="mt-4 text-sm text-gray-500">Cargando…</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
          {results.map((r) => {
            const key = `${r.media_type}-${r.id}`;
            const isSelected = key === selectedKey;
            const main = r.title ?? r.name;
            const original = r.original_title ?? r.original_name;
            const date = r.release_date ?? r.first_air_date;

            return (
              <li key={key} className="py-3">
                <button
                  type="button"
                  onClick={() => setSelectedKey(isSelected ? null : key)}
                  aria-expanded={isSelected}
                  className="flex w-full gap-3 text-left"
                >
                  {r.poster_path ? (
                    <img
                      src={`${IMG_URL}${r.poster_path}`}
                      alt=""
                      className="h-[92px] w-16 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-[92px] w-16 shrink-0 rounded-md bg-gray-200 dark:bg-gray-800" />
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
                </button>

                {isSelected && (
                  <div className="mt-3 pl-[76px]">
                    <ProviderList item={r} country={country} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}

export default App;