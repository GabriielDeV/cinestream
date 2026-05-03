import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TmdbGenre, TmdbMovie, TmdbMovieDetails } from '../models/tmdb-movie.model';
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
    };
  }
}
