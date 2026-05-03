import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBannerComponent {
  @Input({ required: true }) movie!: Movie;

  get backgroundStyle(): Record<string, string> {
    return {
      'background-image': `url('${this.movie.backdropUrl}')`,
    };
  }

  get primaryGenre(): string {
    return this.movie.genres[0] ?? '';
  }

  get genreList(): string {
    return this.movie.genres.slice(0, 2).join(' · ');
  }
}
