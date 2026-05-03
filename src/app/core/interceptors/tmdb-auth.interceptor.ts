import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Adiciona o header Authorization: Bearer <token> em todas as requisições
 * destinadas à API TMDB. Outras URLs não são afetadas.
 */
export const tmdbAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.tmdbApiUrl)) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${environment.tmdbToken}`,
      Accept: 'application/json',
    },
  });

  return next(authReq);
};
