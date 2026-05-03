import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  TmdbGenre,
  TmdbMovie,
  TmdbMovieDetails,
  TmdbMultiSearchItem,
  TmdbTvShow,
  TmdbTvShowDetails,
} from '../models/tmdb-movie.model';
import { Movie } from '../models/movie.model';

const POSTER_PLACEHOLDER = 'assets/images/movie-placeholder.jpg';
const BACKDROP_PLACEHOLDER = 'assets/images/banner-placeholder.jpg';
const NO_DESCRIPTION = 'Sinopse não disponível no momento.';

@Injectable({ providedIn: 'root' })
export class MovieMapper {
  buildImageUrl(path: string | null, size: 'w500' | 'w780' | 'original'): string {
    if (!path) {
      return size === 'original' ? BACKDROP_PLACEHOLDER : POSTER_PLACEHOLDER;
    }
    return `${environment.tmdbImageUrl}/${size}${path}`;
  }

  // ── Movies ──────────────────────────────────────────────────────────────────

  mapTmdbMovieToMovie(
    tmdbMovie: TmdbMovie,
    genres: TmdbGenre[],
    ranking?: number,
  ): Movie {
    const genreMap = new Map(genres.map((g) => [g.id, g.name]));
    const releaseYear = tmdbMovie.release_date
      ? new Date(tmdbMovie.release_date + 'T12:00:00').getFullYear()
      : null;

    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      description: tmdbMovie.overview?.trim() || NO_DESCRIPTION,
      posterUrl: this.buildImageUrl(tmdbMovie.poster_path, 'w500'),
      backdropUrl: this.buildImageUrl(tmdbMovie.backdrop_path, 'original'),
      releaseDate: tmdbMovie.release_date,
      releaseYear,
      rating: Math.round(tmdbMovie.vote_average * 10) / 10,
      genres: tmdbMovie.genre_ids
        .map((id) => genreMap.get(id))
        .filter((name): name is string => !!name),
      ranking,
      isFavorite: false,
      tag: ranking ? 'Top 10' : undefined,
      mediaType: 'movie',
    };
  }

  mapTmdbMoviesToMovies(
    tmdbMovies: TmdbMovie[],
    genres: TmdbGenre[],
    options: { withRanking?: boolean; defaultTag?: string } = {},
  ): Movie[] {
    return tmdbMovies
      .filter((m) => !m.adult)
      .map((m, index) => {
        const ranking = options.withRanking ? index + 1 : undefined;
        const movie = this.mapTmdbMovieToMovie(m, genres, ranking);
        if (options.defaultTag) {
          return { ...movie, tag: options.defaultTag };
        }
        return movie;
      });
  }

  /** Maps a TMDB movie details response (from /movie/{id}) to the internal Movie model. */
  mapTmdbMovieDetailsToMovie(details: TmdbMovieDetails): Movie {
    const releaseYear = details.release_date
      ? new Date(details.release_date + 'T12:00:00').getFullYear()
      : null;

    return {
      id: details.id,
      title: details.title,
      description: details.overview?.trim() || NO_DESCRIPTION,
      posterUrl: this.buildImageUrl(details.poster_path, 'w500'),
      backdropUrl: this.buildImageUrl(details.backdrop_path, 'original'),
      releaseDate: details.release_date,
      releaseYear,
      rating: Math.round(details.vote_average * 10) / 10,
      genres: details.genres.map((g) => g.name),
      ranking: undefined,
      isFavorite: false,
      mediaType: 'movie',
    };
  }

  // ── TV Shows ─────────────────────────────────────────────────────────────────

  mapTmdbTvShowToMovie(
    tvShow: TmdbTvShow,
    genres: TmdbGenre[],
    ranking?: number,
  ): Movie {
    const genreMap = new Map(genres.map((g) => [g.id, g.name]));
    const releaseYear = tvShow.first_air_date
      ? new Date(tvShow.first_air_date + 'T12:00:00').getFullYear()
      : null;

    return {
      id: tvShow.id,
      title: tvShow.name,
      description: tvShow.overview?.trim() || NO_DESCRIPTION,
      posterUrl: this.buildImageUrl(tvShow.poster_path, 'w500'),
      backdropUrl: this.buildImageUrl(tvShow.backdrop_path, 'original'),
      releaseDate: tvShow.first_air_date,
      releaseYear,
      rating: Math.round(tvShow.vote_average * 10) / 10,
      genres: tvShow.genre_ids
        .map((id) => genreMap.get(id))
        .filter((name): name is string => !!name),
      ranking,
      isFavorite: false,
      tag: ranking ? 'Top 10' : undefined,
      mediaType: 'tv',
    };
  }

  mapTmdbTvShowsToMovies(
    tvShows: TmdbTvShow[],
    genres: TmdbGenre[],
    options: { withRanking?: boolean; defaultTag?: string } = {},
  ): Movie[] {
    return tvShows
      .filter((s) => !s.adult)
      .map((s, index) => {
        const ranking = options.withRanking ? index + 1 : undefined;
        const item = this.mapTmdbTvShowToMovie(s, genres, ranking);
        if (options.defaultTag) {
          return { ...item, tag: options.defaultTag };
        }
        return item;
      });
  }

  /** Maps a TMDB TV show details response (from /tv/{id}) to the internal Movie model. */
  mapTmdbTvShowDetailsToMovie(details: TmdbTvShowDetails): Movie {
    const releaseYear = details.first_air_date
      ? new Date(details.first_air_date + 'T12:00:00').getFullYear()
      : null;

    return {
      id: details.id,
      title: details.name,
      description: details.overview?.trim() || NO_DESCRIPTION,
      posterUrl: this.buildImageUrl(details.poster_path, 'w500'),
      backdropUrl: this.buildImageUrl(details.backdrop_path, 'original'),
      releaseDate: details.first_air_date,
      releaseYear,
      rating: Math.round(details.vote_average * 10) / 10,
      genres: details.genres.map((g) => g.name),
      ranking: undefined,
      isFavorite: false,
      mediaType: 'tv',
    };
  }

  // ── Multi-search ──────────────────────────────────────────────────────────────

  /**
   * Maps a single /search/multi result item to a Movie.
   * Returns null for person results (must be filtered out).
   * Genre names will be empty if genre maps are not provided —
   * this is acceptable since cards do not display genres.
   */
  mapMultiSearchItemToMovie(
    item: TmdbMultiSearchItem,
    movieGenres: TmdbGenre[] = [],
    tvGenres: TmdbGenre[] = [],
  ): Movie | null {
    if (item.media_type === 'person') return null;
    if (item.adult) return null;

    const genres = item.media_type === 'tv' ? tvGenres : movieGenres;
    const genreMap = new Map(genres.map((g) => [g.id, g.name]));

    const title =
      item.media_type === 'tv' ? (item.name ?? '') : (item.title ?? '');
    const releaseDate =
      item.media_type === 'tv'
        ? (item.first_air_date ?? '')
        : (item.release_date ?? '');
    const releaseYear = releaseDate
      ? new Date(releaseDate + 'T12:00:00').getFullYear()
      : null;

    return {
      id: item.id,
      title,
      description: item.overview?.trim() || NO_DESCRIPTION,
      posterUrl: this.buildImageUrl(item.poster_path, 'w500'),
      backdropUrl: this.buildImageUrl(item.backdrop_path, 'original'),
      releaseDate,
      releaseYear,
      rating: Math.round(item.vote_average * 10) / 10,
      genres: (item.genre_ids ?? [])
        .map((id) => genreMap.get(id))
        .filter((name): name is string => !!name),
      isFavorite: false,
      tag: item.media_type === 'tv' ? 'Série' : undefined,
      mediaType: item.media_type,
    };
  }

  /** Maps all non-person /search/multi results to Movie[]. */
  mapMultiSearchResultsToMovies(
    items: TmdbMultiSearchItem[],
    movieGenres: TmdbGenre[] = [],
    tvGenres: TmdbGenre[] = [],
  ): Movie[] {
    return items
      .map((item) => this.mapMultiSearchItemToMovie(item, movieGenres, tvGenres))
      .filter((m): m is Movie => m !== null);
  }
}
