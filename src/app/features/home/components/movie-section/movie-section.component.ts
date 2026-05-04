import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { Movie, MovieCardLayout, MovieSectionLayout } from '../../../../core/models/movie.model';
import { MovieCardComponent } from '../../../../shared/components/movie-card/movie-card.component';
import { RankingCardComponent } from '../../../../shared/components/ranking-card/ranking-card.component';

@Component({
  selector: 'app-movie-section',
  standalone: true,
  imports: [MovieCardComponent, RankingCardComponent],
  templateUrl: './movie-section.component.html',
  styleUrl: './movie-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieSectionComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) movies!: Movie[];
  @Input() layout: MovieSectionLayout = 'landscape';

  /** Propagates card selection to the parent (e.g. HomeComponent for navigation). */
  @Output() movieSelected = new EventEmitter<Movie>();

  @ViewChild('scrollContainer', { static: false })
  scrollContainer!: ElementRef<HTMLElement>;

  /** Whether the cards row overflows — controls nav button visibility. */
  readonly canScroll = signal(false);

  private readonly zone = inject(NgZone);
  private resizeObserver?: ResizeObserver;

  get cardLayout(): MovieCardLayout {
    return this.layout === 'poster' ? 'poster' : 'landscape';
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => {
        this.zone.run(() => this.checkScrollable());
      });
      this.resizeObserver.observe(this.scrollContainer.nativeElement);
    });
    this.checkScrollable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movies'] && this.scrollContainer) {
      // Defer one tick so Angular can update the DOM before measuring.
      Promise.resolve().then(() => this.checkScrollable());
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  scrollRight(): void {
    const el = this.scrollContainer.nativeElement;
    const amount = this.getScrollAmount(el);
    const maxScroll = el.scrollWidth - el.clientWidth;
    const tolerance = 8;

    const isAtEnd = el.scrollLeft >= maxScroll - tolerance;

    if (isAtEnd) {
      // Loop: already at the end, jump back to the start.
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      // Advance, but never exceed maxScroll.
      const nextScrollLeft = Math.min(el.scrollLeft + amount, maxScroll);
      el.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
    }
  }

  scrollLeft(): void {
    const el = this.scrollContainer.nativeElement;
    const amount = this.getScrollAmount(el);
    const maxScroll = el.scrollWidth - el.clientWidth;
    const tolerance = 8;

    const isAtStart = el.scrollLeft <= tolerance;

    if (isAtStart) {
      // Loop: already at the start, jump to the end.
      el.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      // Go back, but never go below 0.
      const previousScrollLeft = Math.max(el.scrollLeft - amount, 0);
      el.scrollTo({ left: previousScrollLeft, behavior: 'smooth' });
    }
  }

  private checkScrollable(): void {
    if (!this.scrollContainer) return;
    const el = this.scrollContainer.nativeElement;
    this.canScroll.set(el.scrollWidth > el.clientWidth + 4);
  }

  /**
   * Calculates how many pixels to scroll per button click.
   * Scrolls by (visibleCards − 1) cards so one card always
   * overlaps between "pages", giving visual context.
   */
  private getScrollAmount(el: HTMLElement): number {
    const row = el.firstElementChild as HTMLElement | null;
    const firstCard = row?.firstElementChild as HTMLElement | null;

    if (firstCard) {
      const cardWidth = firstCard.getBoundingClientRect().width;
      const gap = parseFloat(
        window.getComputedStyle(row!).columnGap || '16',
      );
      const step = cardWidth + gap;
      const visible = Math.floor(el.clientWidth / step);
      return Math.max(1, visible - 1) * step;
    }

    return Math.round(el.clientWidth * 0.85);
  }
}
