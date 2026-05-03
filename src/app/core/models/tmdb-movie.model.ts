export interface TmdbMovieResponse {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMovie {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface TmdbGenreResponse {
  genres: TmdbGenre[];
}

export interface TmdbGenre {
  id: number;
  name: string;
}

/**
 * Response shape from the TMDB /movie/{id} details endpoint.
 * Unlike TmdbMovie (list item), genres here are full objects, not IDs.
 */
export interface TmdbMovieDetails {
  adult: boolean;
  backdrop_path: string | null;
  genres: TmdbGenre[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

// ── TV Shows ─────────────────────────────────────────────────────────────────

export interface TmdbTvShow {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
}

export interface TmdbTvResponse {
  page: number;
  results: TmdbTvShow[];
  total_pages: number;
  total_results: number;
}

/** Response shape from the TMDB /tv/{id} details endpoint. */
export interface TmdbTvShowDetails {
  adult: boolean;
  backdrop_path: string | null;
  genres: TmdbGenre[];
  id: number;
  name: string;
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
}

// ── Multi-search ──────────────────────────────────────────────────────────────

/**
 * A single result from /search/multi.
 * `media_type` discriminates movies, TV shows, and people.
 * Person results must be filtered out in the mapper.
 */
export interface TmdbMultiSearchItem {
  adult?: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  /** Present when media_type === 'movie' */
  title?: string;
  /** Present when media_type === 'movie' */
  release_date?: string;
  /** Present when media_type === 'tv' */
  name?: string;
  /** Present when media_type === 'tv' */
  first_air_date?: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
}

export interface TmdbMultiSearchResponse {
  page: number;
  results: TmdbMultiSearchItem[];
  total_pages: number;
  total_results: number;
}

