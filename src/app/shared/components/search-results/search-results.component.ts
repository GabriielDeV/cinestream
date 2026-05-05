import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Movie } from '../../../core/models/movie.model';
import { LoadingComponent } from '../loading/loading.component';
import { ErrorMessageComponent } from '../error-message/error-message.component';

const PLACEHOLDER_IMAGE = 'assets/images/movie-placeholder.jpg';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [LoadingComponent, ErrorMessageComponent],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent {
  @Input({ required: true }) results!: Movie[];
  @Input({ required: true }) query!: string;
  @Input() isLoading = false;
  @Input() error: string | null = null;

  @Output() contentSelected = new EventEmitter<Movie>();

  get resultsLabel(): string {
    const n = this.results.length;
    if (n === 1) return 'Encontramos 1 título relacionado à sua busca';
    return `Encontramos ${n} títulos relacionados à sua busca`;
  }

  getImageSrc(movie: Movie): string {
    return movie.backdropUrl || movie.posterUrl || PLACEHOLDER_IMAGE;
  }

  getTypeLabel(movie: Movie): string {
    return movie.mediaType === 'tv' ? 'SÉRIE' : 'FILME';
  }

  onCardClick(movie: Movie): void {
    this.contentSelected.emit(movie);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== PLACEHOLDER_IMAGE) {
      img.src = PLACEHOLDER_IMAGE;
    }
  }

  trackById(_index: number, movie: Movie): number {
    return movie.id;
  }
}
