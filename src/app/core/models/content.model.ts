export type ContentType = 'movie' | 'series';
export type ContentCardLayout = 'landscape' | 'poster' | 'ranking' | 'featured';

export interface CatalogContent {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  genres: string[];
  ageRating: string;
  releaseYear: number;
  duration: string;
  imageUrl: string;
  backgroundUrl: string;
  badge: string | null;
  ranking: number | null;
  isNew: boolean;
  isFavorite: boolean;
}

export interface ContentSection {
  id: string;
  title: string;
  layout: ContentCardLayout;
  items: CatalogContent[];
}

export interface HomeCatalogData {
  featuredContent: CatalogContent;
  sections: ContentSection[];
}
