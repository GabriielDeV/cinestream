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
import { TmdbGenre, TmdbMovieResponse, TmdbTvResponse } from '../../core/models/tmdb-movie.model';
import { Movie } from '../../core/models/movie.model';
import { TmdbService } from '../../core/services/tmdb.service';
import { MovieMapper } from '../../core/mappers/movie.mapper';
import { SiteHeaderComponent } from '../../shared/components/site-header/site-header.component';
import { MovieSectionComponent } from '../home/components/movie-section/movie-section.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';

const EMPTY_RESPONSE: TmdbMovieResponse = { page: 1, results: [], total_pages: 0, total_results: 0 };
const EMPTY_TV_RESPONSE: TmdbTvResponse = { page: 1, results: [], total_pages: 0, total_results: 0 };

@Component({
  selector: 'app-new-and-popular-page',
  standalone: true,
  imports: [
    SiteHeaderComponent,
    MovieSectionComponent,
    SiteFooterComponent,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './new-and-popular-page.component.html',
  styleUrl: './new-and-popular-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewAndPopularPageComponent implements OnInit {
  private readonly tmdbService = inject(TmdbService);
  private readonly mapper = inject(MovieMapper);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly trendingAll = signal<Movie[]>([]);
  readonly trendingMovies = signal<Movie[]>([]);
  readonly trendingTv = signal<Movie[]>([]);
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
      movieGenres: this.tmdbService.getMovieGenres().pipe(catchError(() => of({ genres: [] as TmdbGenre[] }))),
      tvGenres: this.tmdbService.getTvShowGenres().pipe(catchError(() => of({ genres: [] as TmdbGenre[] }))),
      trendingAll: this.tmdbService.getTrendingAll().pipe(catchError(() => of({ page: 1, results: [], total_pages: 0, total_results: 0 } as any))),
      trendingMovies: this.tmdbService.getTrendingMovies().pipe(catchError(() => of(EMPTY_RESPONSE))),
      trendingTv: this.tmdbService.getTrendingTv().pipe(catchError(() => of(EMPTY_TV_RESPONSE))),
      upcoming: this.tmdbService.getUpcomingMovies().pipe(catchError(() => of(EMPTY_RESPONSE))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ movieGenres, tvGenres, trendingAll, trendingMovies, trendingTv, upcoming }) => {
          this.cachedGenres = movieGenres.genres;
          this.cachedTvGenres = tvGenres.genres;

          this.trendingAll.set(
            this.mapper.mapMultiSearchResultsToMovies(
              trendingAll.results.filter((i: any) => i.media_type !== 'person').slice(0, 20),
              this.cachedGenres,
              this.cachedTvGenres,
            ),
          );

          this.trendingMovies.set(
            this.mapper.mapTmdbMoviesToMovies(
              trendingMovies.results.filter((m) => !m.adult).slice(0, 20),
              this.cachedGenres,
              { defaultTag: 'Em Alta' },
            ),
          );

          this.trendingTv.set(
            this.mapper.mapTmdbTvShowsToMovies(
              trendingTv.results.filter((s) => !s.adult).slice(0, 20),
              this.cachedTvGenres,
              { defaultTag: 'Em Alta' },
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
          this.error.set('Não foi possível carregar o conteúdo. Verifique sua conexão e tente novamente.');
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
