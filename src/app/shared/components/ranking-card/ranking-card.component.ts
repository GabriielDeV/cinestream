import {
  ChangeDetectionStrategy,
  Component,
  Input,
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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = PLACEHOLDER_IMAGE;
  }
}
