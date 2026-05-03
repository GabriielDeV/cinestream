import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Movie } from '../../../core/models/movie.model';

const PLACEHOLDER_IMAGE = 'assets/images/movie-placeholder.jpg';

@Component({
  selector: 'app-ranking-card',
  standalone: true,
  templateUrl: './ranking-card.component.html',
  styleUrl: './ranking-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingCardComponent {
  @Input({ required: true }) movie!: Movie;

  /** Emitted when the user clicks the card or the play button. */
  @Output() movieSelected = new EventEmitter<Movie>();

  onCardClick(): void {
    this.movieSelected.emit(this.movie);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = PLACEHOLDER_IMAGE;
  }
}
