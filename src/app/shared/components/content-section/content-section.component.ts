import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Movie, MovieSectionLayout } from '../../../core/models/movie.model';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { RankingCardComponent } from '../ranking-card/ranking-card.component';

@Component({
  selector: 'app-content-section',
  standalone: true,
  imports: [MovieCardComponent, RankingCardComponent],
  templateUrl: './content-section.component.html',
  styleUrl: './content-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentSectionComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) movies!: Movie[];
  @Input() layout: MovieSectionLayout = 'landscape';
}
