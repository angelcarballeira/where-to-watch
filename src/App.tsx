import { useEffect, useState } from 'react';
import { getRegions, searchTitles } from './api/tmdb';
import CountrySelect from './components/CountrySelect';
import ProviderList from './components/ProviderList';
import type { Region, SearchResult } from './types';

const IMG_URL = 'https://image.tmdb.org/t/p/w185';

function readUrl() {
  const p = new URLSearchParams(window.location.search);
  return { q: p.get('q') ?? '', sel: p.get('sel') };
}

function buildUrl(q: string, sel: string | null) {
  const p = new URLSearchParams();
  if (q.trim()) p.set('q', q);
  if (sel) p.set('sel', sel);
  const s = p.toString();
  return s ? `?${s}` : window.location.pathname;
}

function App() {
  const [query, setQuery] = useState(() => readUrl().q);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [regions, setRegions] = useState<Region[]>([]);
  const [country, setCountry] = useState(
    () => localStorage.getItem('country') ?? 'AR',
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(
    () => readUrl().sel,
  );

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

  function handleQueryChange(value: string) {
    // First character of a new search: add a history entry.
    // While refining the search: replace it, so Back doesn't step through every letter.
    const startingSearch = query.trim() === '' && value.trim() !== '';
    const method = startingSearch ? 'pushState' : 'replaceState';
    window.history[method](null, '', buildUrl(value, selectedKey));
    setQuery(value);
  }

  function handleSelect(key: string) {
    const next = key === selectedKey ? null : key;
    window.history.pushState(null, '', buildUrl(query, next));
    setSelectedKey(next);
  }

  useEffect(() => {
    const onPop = () => {
      const { q, sel } = readUrl();
      setQuery(q);
      setSelectedKey(sel);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-100 text-gray-900 dark:from-slate-950 dark:via-indigo-950 dark:to-blue-950 dark:text-gray-100">
      <main className="mx-auto max-w-2xl p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl font-bold tracking-tight">¿Dónde ver?</h1>
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
          onChange={(e) => handleQueryChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white/70 dark:bg-white/5 p-3 outline-none focus:border-blue-500 dark:border-gray-700"
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
                  onClick={() => handleSelect(key)}
                  aria-expanded={isSelected}
                  className="flex w-full gap-3 text-left"
                >
                  {r.poster_path ? (
                    <img
                      src={`${IMG_URL}${r.poster_path}`}
                      alt=""
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
                </button>

                {isSelected && (
                  <div className="mt-3 pl-19">
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