import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Movie, MovieCardLayout } from '../../../core/models/movie.model';

const PLACEHOLDER_IMAGE = 'assets/images/movie-placeholder.jpg';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: Movie;
  @Input() layout: MovieCardLayout = 'landscape';

  /** Emitted when the user clicks the card body (not the add-to-list button). */
  @Output() movieSelected = new EventEmitter<Movie>();

  /** Returns the best image URL for any layout.
   *  Priority: posterUrl → backdropUrl → placeholder. */
  get imageSrc(): string {
    return this.movie.posterUrl || this.movie.backdropUrl || PLACEHOLDER_IMAGE;
  }

  onCardClick(): void {
    this.movieSelected.emit(this.movie);
  }

  onAddToListClick(event: Event): void {
    event.stopPropagation();
    // Future: dispatch add-to-list action
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // posterUrl was tried first; cascade to backdropUrl before static placeholder.
    const secondary = this.movie.backdropUrl;
    if (!img.dataset['fallback'] && secondary && img.src !== secondary) {
      img.dataset['fallback'] = 'true';
      img.src = secondary;
    } else {
      img.src = PLACEHOLDER_IMAGE;
    }
  }
}
