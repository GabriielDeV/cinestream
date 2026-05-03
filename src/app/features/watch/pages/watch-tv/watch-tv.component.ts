import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeResourceUrl } from '@angular/platform-browser';
import { EMPTY, catchError } from 'rxjs';
import { Movie } from '../../../../core/models/movie.model';
import { EmbedMoviesService } from '../../../../core/services/embed-movies.service';
import { TmdbService } from '../../../../core/services/tmdb.service';
import { MovieMapper } from '../../../../core/mappers/movie.mapper';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-watch-tv',
  standalone: true,
  imports: [LoadingComponent, ErrorMessageComponent],
  templateUrl: './watch-tv.component.html',
  styleUrl: './watch-tv.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchTvComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly embedMoviesService = inject(EmbedMoviesService);
  private readonly tmdbService = inject(TmdbService);
  private readonly mapper = inject(MovieMapper);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly show = signal<Movie | null>(null);
  readonly playerUrl = signal<SafeResourceUrl | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const showId = idParam ? parseInt(idParam, 10) : NaN;

    if (!this.embedMoviesService.isValidId(showId)) {
      this.error.set('Série inválida ou indisponível.');
      this.isLoading.set(false);
      return;
    }

    // Reuse data passed via router navigation state when available
    const stateMovie = (history.state as { movie?: Movie })?.movie;

    if (stateMovie && stateMovie.id === showId && stateMovie.mediaType === 'tv') {
      this.show.set(stateMovie);
      this.playerUrl.set(this.embedMoviesService.getSeriesPlayerUrl(showId));
      this.isLoading.set(false);
    } else {
      this.loadShowFromTmdb(showId);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  private loadShowFromTmdb(showId: number): void {
    this.tmdbService
      .getTvShowById(showId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          // TMDB unavailable: still open the player with the known ID
          this.playerUrl.set(this.embedMoviesService.getSeriesPlayerUrl(showId));
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((details) => {
        this.show.set(this.mapper.mapTmdbTvShowDetailsToMovie(details));
        this.playerUrl.set(this.embedMoviesService.getSeriesPlayerUrl(showId));
        this.isLoading.set(false);
      });
  }
}
