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

  /** Returns the best image URL for the current layout.
   *  landscape → backdrop (16:9); poster → poster art (2:3). */
  get imageSrc(): string {
    if (this.layout === 'landscape') {
      return this.movie.backdropUrl || this.movie.posterUrl;
    }
    return this.movie.posterUrl;
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
    // For landscape: try poster as second chance before the static placeholder
    if (
      this.layout === 'landscape' &&
      !img.dataset['fallback'] &&
      img.src !== this.movie.posterUrl
    ) {
      img.dataset['fallback'] = 'true';
      img.src = this.movie.posterUrl;
    } else {
      img.src = PLACEHOLDER_IMAGE;
    }
  }
}
