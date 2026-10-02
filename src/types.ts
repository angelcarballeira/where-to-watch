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