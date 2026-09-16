import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export type Rol = 'ADMIN' | 'RECEPCIONISTA' | 'CLIENTE';

export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  usuario: string;
  rol: Rol;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly tokenKey = 'golds_gym_token';
  private readonly userKey = 'golds_gym_user';
  private readonly currentUser = signal<AuthResponse | null>(this.readUser());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response));
        this.currentUser.set(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  user(): AuthResponse | null {
    return this.currentUser();
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  hasRole(...roles: Rol[]): boolean {
    const role = this.user()?.rol;
    return !!role && roles.includes(role);
  }

  private readUser(): AuthResponse | null {
    const storedUser = localStorage.getItem(this.userKey);
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthResponse;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
