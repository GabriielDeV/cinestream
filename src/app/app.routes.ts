import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'CineStream – Sua plataforma de streaming',
  },
  {
    path: 'movies',
    loadComponent: () =>
      import('./features/movies/movies-page.component').then(
        (m) => m.MoviesPageComponent,
      ),
    title: 'Filmes – CineStream',
  },
  {
    path: 'series',
    loadComponent: () =>
      import('./features/series/series-page.component').then(
        (m) => m.SeriesPageComponent,
      ),
    title: 'Séries – CineStream',
  },
  {
    path: 'new-and-popular',
    loadComponent: () =>
      import('./features/new-and-popular/new-and-popular-page.component').then(
        (m) => m.NewAndPopularPageComponent,
      ),
    title: 'Novos e Populares – CineStream',
  },
  {
    path: 'watch/movie/:id',
    loadComponent: () =>
      import('./features/watch/pages/watch-movie/watch-movie.component').then(
        (m) => m.WatchMovieComponent,
      ),
    title: 'Assistir – CineStream',
  },
  {
    path: 'watch/tv/:id',
    loadComponent: () =>
      import('./features/watch/pages/watch-tv/watch-tv.component').then(
        (m) => m.WatchTvComponent,
      ),
    title: 'Assistir Série – CineStream',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

