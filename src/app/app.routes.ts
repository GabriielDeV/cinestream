import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'CineStream – Sua plataforma de streaming',
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
    path: '**',
    redirectTo: '',
  },
];
