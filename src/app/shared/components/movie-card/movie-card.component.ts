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

  onCardClick(): void {
    this.movieSelected.emit(this.movie);
  }

  onAddToListClick(event: Event): void {
    event.stopPropagation();
    // Future: dispatch add-to-list action
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = PLACEHOLDER_IMAGE;
  }
}
