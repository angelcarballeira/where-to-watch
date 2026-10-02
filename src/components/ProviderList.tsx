import { useEffect, useState } from 'react';
import { getWatchProviders } from '../api/tmdb';
import type { AllProviders, SearchResult } from '../types';

const LOGO_URL = 'https://image.tmdb.org/t/p/w92';

const GROUPS = [
  { key: 'flatrate', label: 'Stream' },
  { key: 'free', label: 'Free' },
  { key: 'ads', label: 'Free with ads' },
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
] as const;

type Props = {
  item: SearchResult;
  country: string;
};

export default function ProviderList({ item, country }: Props) {
  const [data, setData] = useState<AllProviders | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getWatchProviders(item.media_type, item.id, controller.signal)
      .then(setData)
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError('Could not load providers.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [item.id, item.media_type]);

  if (loading) return <p className="text-sm text-gray-500">Cargando proveedores...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const info = data?.[country];
  if (!info) {
    return (
      <p className="text-sm text-gray-500">
        No se encontraron proveedores en esta región.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {GROUPS.map(({ key, label }) => {
        const list = info[key];
        if (!list?.length) return null;
        return (
          <div key={key}>
            <p className="mb-1 text-xs text-gray-400">{label}</p>
            <div className="flex flex-wrap gap-2">
              {list.map((p) => (
                <span
                  key={p.provider_id}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 py-1 pl-1 pr-3 text-sm dark:border-gray-800"
                >
                  <img
                    src={`${LOGO_URL}${p.logo_path}`}
                    alt=""
                    className="h-7 w-7 rounded-md"
                  />
                  {p.provider_name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-gray-400">Streaming data by JustWatch.</p>
    </div>
  );
}