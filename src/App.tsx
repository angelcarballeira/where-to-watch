import { useEffect, useState } from 'react';
import { searchTitles } from './api/tmdb';
import type { SearchResult } from './types';
import './App.css';

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
    // Debounce: wait 400 ms after the user stops typing.
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
    <main className="app">
      <h1>Where to watch</h1>
      <input
        type="search"
        placeholder="Search a movie or series"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      <ul className="results">
        {results.map((r) => {
          const main = r.title ?? r.name;
          const original = r.original_title ?? r.original_name;
          const date = r.release_date ?? r.first_air_date;
          return (
            <li key={`${r.media_type}-${r.id}`}>
              {r.poster_path ? (
                <img src={`${IMG_URL}${r.poster_path}`} alt={main} />
              ) : (
                <div className="no-poster" />
              )}
              <div>
                <strong>{main}</strong>
                {original && original !== main && (
                  <div className="subtitle">{original}</div>
                )}
                <div className="meta">
                  {r.media_type === 'movie' ? 'Movie' : 'Series'}
                  {date && ` · ${date.slice(0, 4)}`}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export default App;