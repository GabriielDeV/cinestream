import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TmdbGenreResponse, TmdbMovieDetails, TmdbMovieResponse } from '../models/tmdb-movie.model';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.tmdbApiUrl;

  private params(extra: Record<string, string> = {}): HttpParams {
    return new HttpParams({ fromObject: { language: 'pt-BR', ...extra } });
  }

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

  /**
   * Busca filmes por texto.
   * TODO: Estender para buscar séries via /search/tv quando necessário.
   */
  searchMovies(query: string, page = 1): Observable<TmdbMovieResponse> {
    return this.http.get<TmdbMovieResponse>(`${this.apiUrl}/search/movie`, {
      params: this.params({ query, page: String(page) }),
    });
  }

  /** Detalhes completos de um filme pelo seu ID TMDB. */
  getMovieById(id: number): Observable<TmdbMovieDetails> {
    return this.http.get<TmdbMovieDetails>(`${this.apiUrl}/movie/${id}`, {
      params: this.params(),
    });
  }
}
