import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthResult, LoginRequest, RefreshRequest, RegisterRequest } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshTimeoutId: any = null;

  private authChanged$ = new BehaviorSubject<boolean>(false);
  authChanged = this.authChanged$.asObservable();

  // Models
  register(payload: RegisterRequest): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${environment.apiUrl}/Auth/register`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  login(payload: LoginRequest): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${environment.apiUrl}/Auth/login`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  refreshTokenRequest(): Observable<AuthResult> {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      return throwError(() => new Error('No refresh token available'));
    }
    const body: RefreshRequest = { refreshToken: refresh };
    return this.http.post<AuthResult>(`${environment.apiUrl}/Auth/refresh`, body).pipe(
      tap((res) => this.setSession(res))
    );
  }

  // Session helpers
  getAccessToken(): string | null {
    return this.accessToken ?? localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return this.refreshToken ?? localStorage.getItem('refresh_token');
  }

  setSession(auth: AuthResult): void {
    this.accessToken = auth.token;
    this.refreshToken = auth.refreshToken;
    localStorage.setItem('access_token', auth.token);
    localStorage.setItem('refresh_token', auth.refreshToken);
    this.scheduleRefresh();
    this.authChanged$.next(true);
  }

  clearSession(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
    this.authChanged$.next(false);
  }

  getTokenExpiry(token: string): number {
    try {
      const payload = token.split('.')[1];
      if (!payload) return 0;
      // base64url decode
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const decoded = JSON.parse(atob(padded));
      const exp = decoded?.exp;
      return typeof exp === 'number' ? exp : 0;
    } catch {
      return 0;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    const exp = this.getTokenExpiry(token);
    const now = Math.floor(Date.now() / 1000);
    return exp > now + 5; // allow 5s clock skew
  }

  logout(showNotice = true): void {
    this.clearSession();
    if (showNotice) {
      // Minimal UX without external libs
      try { console.warn('Logged out'); } catch {}
    }
    this.router.navigateByUrl('/login');
  }

  initFromStorage(): void {
    const storedAccess = localStorage.getItem('access_token');
    const storedRefresh = localStorage.getItem('refresh_token');
    if (storedAccess && storedRefresh) {
      this.accessToken = storedAccess;
      this.refreshToken = storedRefresh;
      if (this.isAuthenticated()) {
        this.scheduleRefresh();
        this.authChanged$.next(true);
        return;
      }
    }
    this.clearSession();
  }

  scheduleRefresh(): void {
    if (!this.accessToken) return;
    const exp = this.getTokenExpiry(this.accessToken);
    const now = Math.floor(Date.now() / 1000);
    const secondsUntilExp = Math.max(exp - now, 0);
    // refresh 60s before expiry, but not sooner than 2s
    const refreshInSeconds = Math.max(secondsUntilExp - 60, 2);
    const ms = refreshInSeconds * 1000;
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
    this.refreshTimeoutId = setTimeout(() => {
      this.refreshTokenRequest().subscribe({
        next: () => {
          // tokens updated by tap in refreshTokenRequest; reschedule
          this.scheduleRefresh();
        },
        error: () => {
          this.logout(false);
        },
      });
    }, ms);
  }
}

