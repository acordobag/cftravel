import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

import { environment } from '../environments/environment';
const API_URL = environment.apiUrl;
const TOKEN_KEY = 'cr_travel_token';
const USER_KEY = 'cr_travel_user';

export interface AuthUser {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'SUPER';
  active: boolean;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<AuthUser | null>(this.loadStoredUser());

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  get token(): string {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  login(payload: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, payload).pipe(
      tap((response) => this.setSession(response))
    );
  }

  signup(payload: { name: string; lastName: string; email: string; phone: string; password: string }) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/signup`, payload).pipe(
      tap((response) => this.setSession(response))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  setCurrentUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  isPrivileged(): boolean {
    return ['ADMIN', 'SUPER'].includes(this.currentUser()?.role || '');
  }

  isSuper(): boolean {
    return this.currentUser()?.role === 'SUPER';
  }

  authOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    };
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  private loadStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as AuthUser : null;
  }
}
