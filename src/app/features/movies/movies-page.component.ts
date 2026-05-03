import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { TmdbGenre, TmdbMovieResponse } from '../../core/models/tmdb-movie.model';
import { Movie } from '../../core/models/movie.model';
import { TmdbService } from '../../core/services/tmdb.service';
import { MovieMapper } from '../../core/mappers/movie.mapper';
import { SiteHeaderComponent } from '../../shared/components/site-header/site-header.component';
import { MovieSectionComponent } from '../home/components/movie-section/movie-section.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';

const EMPTY_RESPONSE: TmdbMovieResponse = {
  page: 1,
  results: [],
  total_pages: 0,
  total_results: 0,
};

@Component({
  selector: 'app-movies-page',
  standalone: true,
  imports: [
    SiteHeaderComponent,
    MovieSectionComponent,
    SiteFooterComponent,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './movies-page.component.html',
  styleUrl: './movies-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoviesPageComponent implements OnInit {
  private readonly tmdbService = inject(TmdbService);
  private readonly mapper = inject(MovieMapper);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly popularMovies = signal<Movie[]>([]);
  readonly topRatedMovies = signal<Movie[]>([]);
  readonly nowPlayingMovies = signal<Movie[]>([]);
  readonly upcomingMovies = signal<Movie[]>([]);

  readonly searchResults = signal<Movie[]>([]);
  readonly isSearchActive = signal(false);
  readonly isSearchLoading = signal(false);
  readonly searchError = signal<string | null>(null);

  private cachedGenres: TmdbGenre[] = [];
  private cachedTvGenres: TmdbGenre[] = [];
  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadData();
    this.setupSearch();
  }

  private loadData(): void {
    forkJoin({
      genres: this.tmdbService.getMovieGenres().pipe(catchError(() => of({ genres: [] as TmdbGenre[] }))),
      popular: this.tmdbService.getPopularMovies().pipe(catchError(() => of(EMPTY_RESPONSE))),
      topRated: this.tmdbService.getTopRatedMovies().pipe(catchError(() => of(EMPTY_RESPONSE))),
      nowPlaying: this.tmdbService.getNowPlayingMovies().pipe(catchError(() => of(EMPTY_RESPONSE))),
      upcoming: this.tmdbService.getUpcomingMovies().pipe(catchError(() => of(EMPTY_RESPONSE))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ genres, popular, topRated, nowPlaying, upcoming }) => {
          this.cachedGenres = genres.genres;

          this.popularMovies.set(
            this.mapper.mapTmdbMoviesToMovies(
              popular.results.filter((m) => !m.adult).slice(0, 20),
              this.cachedGenres,
            ),
          );

          this.topRatedMovies.set(
            this.mapper.mapTmdbMoviesToMovies(
              topRated.results.filter((m) => !m.adult).slice(0, 10),
              this.cachedGenres,
              { withRanking: true },
            ),
          );

          this.nowPlayingMovies.set(
            this.mapper.mapTmdbMoviesToMovies(
              nowPlaying.results.filter((m) => !m.adult).slice(0, 20),
              this.cachedGenres,
              { defaultTag: 'Em Cartaz' },
            ),
          );

          this.upcomingMovies.set(
            this.mapper.mapTmdbMoviesToMovies(
              upcoming.results.filter((m) => !m.adult).slice(0, 12),
              this.cachedGenres,
              { defaultTag: 'Em Breve' },
            ),
          );

          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Não foi possível carregar os filmes. Verifique sua conexão e tente novamente.');
          this.isLoading.set(false);
        },
      });
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((query) => {
          if (query.trim().length < 2) {
            this.isSearchActive.set(false);
            this.searchResults.set([]);
            this.isSearchLoading.set(false);
            this.searchError.set(null);
          }
        }),
        filter((query) => query.trim().length >= 2),
        tap(() => {
          this.isSearchLoading.set(true);
          this.searchError.set(null);
        }),
        switchMap((query) =>
          this.tmdbService.searchMulti(query.trim()).pipe(
            map((response) =>
              response.results.filter((item) => item.media_type !== 'person').slice(0, 20),
            ),
            catchError(() => {
              this.searchError.set('Não foi possível realizar a busca. Tente novamente.');
              return of([]);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.searchResults.set(
          this.mapper.mapMultiSearchResultsToMovies(results, this.cachedGenres, this.cachedTvGenres),
        );
        this.isSearchActive.set(true);
        this.isSearchLoading.set(false);
      });
  }

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  onMovieSelected(movie: Movie): void {
    const route = movie.mediaType === 'tv' ? '/watch/tv' : '/watch/movie';
    this.router.navigate([route, movie.id], { state: { movie } });
  }

  onRetry(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.loadData();
  }
}
