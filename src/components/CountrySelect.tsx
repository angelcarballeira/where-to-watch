import type { Region } from '../types';

type Props = {
  regions: Region[];
  value: string;
  onChange: (code: string) => void;
};

// Browser built-in: turns "AR" into "Argentina" in Spanish.
const names = new Intl.DisplayNames(['es'], { type: 'region' });

export default function CountrySelect({ regions, value, onChange }: Props) {
  const options = regions
    .map((r) => ({
      code: r.iso_3166_1,
      label: names.of(r.iso_3166_1) ?? r.english_name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="País"
      className="rounded-lg border border-gray-300 bg-transparent p-2 text-sm dark:border-gray-700 dark:bg-gray-950"
    >
      {options.map((o) => (
        <option key={o.code} value={o.code}>
          {o.label}
        </option>
      ))}
    </select>
  );
}