import { ChangeDetectionStrategy, Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-site-header',
  standalone: true,
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeaderComponent {
  @Output() search = new EventEmitter<string>();

  readonly navItems = [
    { label: 'Início', active: true },
    { label: 'Filmes', active: false },
    { label: 'Séries', active: false },
    { label: 'Novos e Populares', active: false },
    { label: 'Minha Lista', active: false },
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
