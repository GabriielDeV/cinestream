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
import { TmdbGenre, TmdbTvResponse } from '../../core/models/tmdb-movie.model';
import { Movie } from '../../core/models/movie.model';
import { TmdbService } from '../../core/services/tmdb.service';
import { MovieMapper } from '../../core/mappers/movie.mapper';
import { SiteHeaderComponent } from '../../shared/components/site-header/site-header.component';
import { MovieSectionComponent } from '../home/components/movie-section/movie-section.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';

const EMPTY_TV_RESPONSE: TmdbTvResponse = {
  page: 1,
  results: [],
  total_pages: 0,
  total_results: 0,
};

@Component({
  selector: 'app-series-page',
  standalone: true,
  imports: [
    SiteHeaderComponent,
    MovieSectionComponent,
    SiteFooterComponent,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './series-page.component.html',
  styleUrl: './series-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeriesPageComponent implements OnInit {
  private readonly tmdbService = inject(TmdbService);
  private readonly mapper = inject(MovieMapper);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly popularSeries = signal<Movie[]>([]);
  readonly topRatedSeries = signal<Movie[]>([]);
  readonly onTheAirSeries = signal<Movie[]>([]);
  readonly airingTodaySeries = signal<Movie[]>([]);

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
      tvGenres: this.tmdbService.getTvShowGenres().pipe(catchError(() => of({ genres: [] as TmdbGenre[] }))),
      popular: this.tmdbService.getPopularTvShows().pipe(catchError(() => of(EMPTY_TV_RESPONSE))),
      topRated: this.tmdbService.getTopRatedTvShows().pipe(catchError(() => of(EMPTY_TV_RESPONSE))),
      onTheAir: this.tmdbService.getOnTheAirTvShows().pipe(catchError(() => of(EMPTY_TV_RESPONSE))),
      airingToday: this.tmdbService.getAiringTodayTvShows().pipe(catchError(() => of(EMPTY_TV_RESPONSE))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ tvGenres, popular, topRated, onTheAir, airingToday }) => {
          this.cachedTvGenres = tvGenres.genres;

          this.popularSeries.set(
            this.mapper.mapTmdbTvShowsToMovies(
              popular.results.filter((s) => !s.adult).slice(0, 20),
              this.cachedTvGenres,
            ),
          );

          this.topRatedSeries.set(
            this.mapper.mapTmdbTvShowsToMovies(
              topRated.results.filter((s) => !s.adult).slice(0, 10),
              this.cachedTvGenres,
              { withRanking: true },
            ),
          );

          this.onTheAirSeries.set(
            this.mapper.mapTmdbTvShowsToMovies(
              onTheAir.results.filter((s) => !s.adult).slice(0, 20),
              this.cachedTvGenres,
              { defaultTag: 'No Ar' },
            ),
          );

          this.airingTodaySeries.set(
            this.mapper.mapTmdbTvShowsToMovies(
              airingToday.results.filter((s) => !s.adult).slice(0, 12),
              this.cachedTvGenres,
              { defaultTag: 'Hoje' },
            ),
          );

          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Não foi possível carregar as séries. Verifique sua conexão e tente novamente.');
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
