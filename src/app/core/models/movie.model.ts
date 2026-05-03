export type MovieCardLayout = 'landscape' | 'poster';
export type MovieSectionLayout = 'landscape' | 'poster' | 'ranking';

export interface Movie {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  releaseYear: number | null;
  rating: number;
  genres: string[];
  ranking?: number;
  isFavorite: boolean;
  tag?: string;
}
