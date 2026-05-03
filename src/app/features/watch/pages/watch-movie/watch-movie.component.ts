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
  selector: 'app-watch-movie',
  standalone: true,
  imports: [LoadingComponent, ErrorMessageComponent],
  templateUrl: './watch-movie.component.html',
  styleUrl: './watch-movie.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchMovieComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly embedMoviesService = inject(EmbedMoviesService);
  private readonly tmdbService = inject(TmdbService);
  private readonly mapper = inject(MovieMapper);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly movie = signal<Movie | null>(null);
  readonly playerUrl = signal<SafeResourceUrl | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const movieId = idParam ? parseInt(idParam, 10) : NaN;

    if (!this.embedMoviesService.isValidId(movieId)) {
      this.error.set('Filme inválido ou indisponível.');
      this.isLoading.set(false);
      return;
    }

    // Try to reuse movie data passed via router navigation state (avoids extra TMDB call)
    const stateMovie = (history.state as { movie?: Movie })?.movie;

    if (stateMovie && stateMovie.id === movieId) {
      this.movie.set(stateMovie);
      this.playerUrl.set(this.embedMoviesService.getMoviePlayerUrl(movieId));
      this.isLoading.set(false);
    } else {
      this.loadMovieFromTmdb(movieId);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  private loadMovieFromTmdb(movieId: number): void {
    this.tmdbService
      .getMovieById(movieId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          // TMDB unavailable: still open the player with the known ID (RN14)
          this.playerUrl.set(this.embedMoviesService.getMoviePlayerUrl(movieId));
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((details) => {
        this.movie.set(this.mapper.mapTmdbMovieDetailsToMovie(details));
        this.playerUrl.set(this.embedMoviesService.getMoviePlayerUrl(movieId));
        this.isLoading.set(false);
      });
  }
}
