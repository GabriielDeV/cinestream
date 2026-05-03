import {
  ChangeDetectionStrategy,
  Component,
  Input,
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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = PLACEHOLDER_IMAGE;
  }
}
