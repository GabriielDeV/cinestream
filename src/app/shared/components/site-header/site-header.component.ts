import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  /** When true, only marks active on exact path match (used for the root route). */
  exactMatch: boolean;
}

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeaderComponent {
  @Output() search = new EventEmitter<string>();

  readonly navItems: NavItem[] = [
    { label: 'Início', path: '/', exactMatch: true },
    { label: 'Filmes', path: '/movies', exactMatch: false },
    { label: 'Séries', path: '/series', exactMatch: false },
    { label: 'Novos e Populares', path: '/new-and-popular', exactMatch: false },
  ];

  isSearchOpen = signal(false);
  searchQuery = signal('');

  openSearch(): void {
    this.isSearchOpen.set(true);
  }

  closeSearch(): void {
    this.isSearchOpen.set(false);
    this.searchQuery.set('');
    this.search.emit('');
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.search.emit(value);
  }
}
