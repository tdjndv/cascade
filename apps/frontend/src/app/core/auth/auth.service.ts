import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

type AuthResponse = { access_token: string };

type TokenClaims = { sub: string; username: string; exp: number };

const TOKEN_KEY = 'cascade_token';

function decode(token: string | null): TokenClaims | null {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(json) as TokenClaims;

    return claims.exp * 1000 > Date.now() ? claims : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly claims = computed(() => decode(this.token()));
  readonly isLoggedIn = computed(() => this.claims() !== null);
  readonly username = computed(() => this.claims()?.username ?? null);
  readonly userId = computed(() => this.claims()?.sub ?? null);

  signUp(email: string, username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/signup', { email, username, password })
      .pipe(tap((res) => this.setToken(res.access_token)));
  }

  signIn(identifier: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/signin', { identifier, password })
      .pipe(tap((res) => this.setToken(res.access_token)));
  }

  signOut(): void {
    this.token.set(null);
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/']);
  }

  private setToken(token: string): void {
    this.token.set(token);
    localStorage.setItem(TOKEN_KEY, token);
  }
}