import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * EmbedMoviesService
 *
 * Sole authority for building EmbedMovies player URLs.
 * EmbedMovies is used exclusively as a player provider via iframe.
 *
 * NOTE: Validate display rights before exposing the player in a production
 * environment. The iframe domain is fixed to ALLOWED_EMBED_ORIGIN and cannot
 * be overridden by external input (RNF02 / RN29).
 */

const ALLOWED_EMBED_ORIGIN = 'https://myembed.biz' as const;

@Injectable({ providedIn: 'root' })
export class EmbedMoviesService {
  private readonly sanitizer = inject(DomSanitizer);

  /**
   * Returns a sanitized SafeResourceUrl for a movie player using its TMDB ID.
   * URL pattern: https://myembed.biz/filme/{tmdbId}
   */
  getMoviePlayerUrl(tmdbId: number): SafeResourceUrl {
    const url = `${ALLOWED_EMBED_ORIGIN}/filme/${tmdbId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Returns a sanitized SafeResourceUrl for a series player using its TMDB ID.
   * URL pattern: https://myembed.biz/serie/{tmdbId}
   * Reserved for future series integration.
   */
  getSeriesPlayerUrl(tmdbId: number): SafeResourceUrl {
    const url = `${ALLOWED_EMBED_ORIGIN}/serie/${tmdbId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Returns a sanitized SafeResourceUrl for a specific episode.
   * URL pattern: https://myembed.biz/serie/{tmdbId}/{seasonNumber}/{episodeNumber}
   * Reserved for future series/episode integration.
   */
  getEpisodePlayerUrl(
    tmdbId: number,
    seasonNumber: number,
    episodeNumber: number,
  ): SafeResourceUrl {
    const url = `${ALLOWED_EMBED_ORIGIN}/serie/${tmdbId}/${seasonNumber}/${episodeNumber}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Guards against non-integer or negative IDs being used to construct player URLs.
   * Always validate before calling getMoviePlayerUrl / getSeriesPlayerUrl.
   */
  isValidId(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value > 0;
  }
}
