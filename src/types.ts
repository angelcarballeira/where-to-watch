export type SearchResult = {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;          // movies (Spanish)
  name?: string;           // series (Spanish)
  original_title?: string; // movies (original)
  original_name?: string;  // series (original)
  overview: string;
  poster_path: string | null;
  release_date?: string;   // movies
  first_air_date?: string; // series
};

export type Region = {
  iso_3166_1: string; // country code, e.g. "AR"
  english_name: string;
  native_name: string;
};

export type Provider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
};

export type CountryProviders = {
  link: string;
  flatrate?: Provider[]; // subscription streaming
  free?: Provider[];
  ads?: Provider[];      // free with ads
  rent?: Provider[];
  buy?: Provider[];
};

export type AllProviders = Record<string, CountryProviders>;