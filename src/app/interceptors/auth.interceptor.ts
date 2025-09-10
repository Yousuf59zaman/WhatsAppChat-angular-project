import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function isApiUrl(url: string): boolean {
  if (!url) return false;
  const baseA = (environment.apiUrl || '').toString();
  const baseB = (environment.apiBaseUrl || '').toString();
  return (!!baseA && url.startsWith(baseA)) || (!!baseB && url.startsWith(baseB));
}

function isAuthEndpoint(url: string): boolean {
  if (!isApiUrl(url)) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith('/auth/login') ||
    lower.endsWith('/auth/register') ||
    lower.endsWith('/auth/refresh')
  );
}

function addAuthHeader(req: any, token: string) {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

export const authInterceptorFactory: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Only attach for API calls and not for auth endpoints
  if (isApiUrl(req.url) && !isAuthEndpoint(req.url)) {
    const access = auth.getAccessToken();
    if (access) {
      req = addAuthHeader(req, access);
    }
  }

  return next(req).pipe(
    catchError((error: any) => {
      const isHttpError = error instanceof HttpErrorResponse;
      if (!isHttpError) return throwError(() => error);

      // Do not handle auth endpoint errors here
      if (!isApiUrl(req.url) || isAuthEndpoint(req.url)) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        // Unauthorized: try refresh once
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);
          return auth.refreshTokenRequest().pipe(
            switchMap((tokens) => {
              refreshTokenSubject.next(tokens.token);
              const retried = addAuthHeader(req, tokens.token);
              return next(retried);
            }),
            catchError((refreshErr) => {
              auth.logout();
              return throwError(() => refreshErr);
            }),
            finalize(() => {
              isRefreshing = false;
            })
          );
        } else {
          // Wait for refresh to complete
          return refreshTokenSubject.pipe(
            filter((t): t is string => t !== null),
            take(1),
            switchMap((newToken) => {
              const retried = addAuthHeader(req, newToken);
              return next(retried);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};
