import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TmdbGenreResponse,
  TmdbMovieDetails,
  TmdbMovieResponse,
  TmdbMultiSearchResponse,
  TmdbTvResponse,
  TmdbTvShowDetails,
} from '../models/tmdb-movie.model';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.tmdbApiUrl;

  private params(extra: Record<string, string> = {}): HttpParams {
    return new HttpParams({ fromObject: { language: 'pt-BR', ...extra } });
  }

  // ── Movies ──────────────────────────────────────────────────────────────────

  /** Filmes em cartaz — inclui region BR */
  getNowPlayingMovies(page = 1): Observable<TmdbMovieResponse> {
    return this.http.get<TmdbMovieResponse>(`${this.apiUrl}/movie/now_playing`, {
      params: this.params({ region: 'BR', page: String(page) }),
    });
  }

  /** Filmes populares — inclui region BR */
  getPopularMovies(page = 1): Observable<TmdbMovieResponse> {
    return this.http.get<TmdbMovieResponse>(`${this.apiUrl}/movie/popular`, {
      params: this.params({ region: 'BR', page: String(page) }),
    });
  }

  /** Filmes mais bem avaliados */
  getTopRatedMovies(page = 1): Observable<TmdbMovieResponse> {
    return this.http.get<TmdbMovieResponse>(`${this.apiUrl}/movie/top_rated`, {
      params: this.params({ region: 'BR', page: String(page) }),
    });
  }

  /** Próximos lançamentos */
  getUpcomingMovies(page = 1): Observable<TmdbMovieResponse> {
    return this.http.get<TmdbMovieResponse>(`${this.apiUrl}/movie/upcoming`, {
      params: this.params({ region: 'BR', page: String(page) }),
    });
  }

  /** Lista de gêneros de filmes */
  getMovieGenres(): Observable<TmdbGenreResponse> {
    return this.http.get<TmdbGenreResponse>(`${this.apiUrl}/genre/movie/list`, {
      params: this.params(),
    });
  }

  /** Detalhes completos de um filme pelo seu ID TMDB. */
  getMovieById(id: number): Observable<TmdbMovieDetails> {
    return this.http.get<TmdbMovieDetails>(`${this.apiUrl}/movie/${id}`, {
      params: this.params(),
    });
  }

  // ── TV Shows ─────────────────────────────────────────────────────────────────

  /** Séries populares */
  getPopularTvShows(page = 1): Observable<TmdbTvResponse> {
    return this.http.get<TmdbTvResponse>(`${this.apiUrl}/tv/popular`, {
      params: this.params({ page: String(page) }),
    });
  }

  /** Séries mais bem avaliadas */
  getTopRatedTvShows(page = 1): Observable<TmdbTvResponse> {
    return this.http.get<TmdbTvResponse>(`${this.apiUrl}/tv/top_rated`, {
      params: this.params({ page: String(page) }),
    });
  }

  /** Séries no ar (airing over the next 7 days) */
  getOnTheAirTvShows(page = 1): Observable<TmdbTvResponse> {
    return this.http.get<TmdbTvResponse>(`${this.apiUrl}/tv/on_the_air`, {
      params: this.params({ page: String(page) }),
    });
  }

  /** Séries exibidas hoje */
  getAiringTodayTvShows(page = 1): Observable<TmdbTvResponse> {
    return this.http.get<TmdbTvResponse>(`${this.apiUrl}/tv/airing_today`, {
      params: this.params({ page: String(page) }),
    });
  }

  /** Lista de gêneros de séries */
  getTvShowGenres(): Observable<TmdbGenreResponse> {
    return this.http.get<TmdbGenreResponse>(`${this.apiUrl}/genre/tv/list`, {
      params: this.params(),
    });
  }

  /** Detalhes completos de uma série pelo seu ID TMDB. */
  getTvShowById(id: number): Observable<TmdbTvShowDetails> {
    return this.http.get<TmdbTvShowDetails>(`${this.apiUrl}/tv/${id}`, {
      params: this.params(),
    });
  }

  // ── Trending ─────────────────────────────────────────────────────────────────

  /** Conteúdos em alta — filmes e séries (semana) */
  getTrendingAll(timeWindow: 'day' | 'week' = 'week'): Observable<TmdbMultiSearchResponse> {
    return this.http.get<TmdbMultiSearchResponse>(
      `${this.apiUrl}/trending/all/${timeWindow}`,
      { params: this.params() },
    );
  }

  /** Filmes em alta */
  getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Observable<TmdbMovieResponse> {
    return this.http.get<TmdbMovieResponse>(
      `${this.apiUrl}/trending/movie/${timeWindow}`,
      { params: this.params() },
    );
  }

  /** Séries em alta */
  getTrendingTv(timeWindow: 'day' | 'week' = 'week'): Observable<TmdbTvResponse> {
    return this.http.get<TmdbTvResponse>(
      `${this.apiUrl}/trending/tv/${timeWindow}`,
      { params: this.params() },
    );
  }

  // ── Search ───────────────────────────────────────────────────────────────────

  /**
   * Busca multi — retorna filmes, séries e pessoas.
   * Filtrar `media_type === 'person'` no mapper para exibir apenas conteúdos audiovisuais.
   */
  searchMulti(query: string, page = 1): Observable<TmdbMultiSearchResponse> {
    return this.http.get<TmdbMultiSearchResponse>(`${this.apiUrl}/search/multi`, {
      params: this.params({ query, page: String(page) }),
    });
  }

  /** Busca somente filmes por texto. */
  searchMovies(query: string, page = 1): Observable<TmdbMovieResponse> {
    return this.http.get<TmdbMovieResponse>(`${this.apiUrl}/search/movie`, {
      params: this.params({ query, page: String(page) }),
    });
  }

  /** Busca somente séries por texto. */
  searchTvShows(query: string, page = 1): Observable<TmdbTvResponse> {
    return this.http.get<TmdbTvResponse>(`${this.apiUrl}/search/tv`, {
      params: this.params({ query, page: String(page) }),
    });
  }
}

