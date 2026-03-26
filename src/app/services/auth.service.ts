import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { AuthResponse } from '../core/models/auth-response.model';
import { ApiResponse } from '../core/models/api-response.model';
import { User, UserRole } from '../core/models/user.model';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  role: UserRole;
  activo?: boolean;

  telefono?: string;
  apellidos?: string;
  matricula?: string;
  carrera?: string;

  cedula?: string;
  especialidad?: string;

  codigoAdmin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;

  private readonly tokenSignal = signal<string | null>(localStorage.getItem('token'));
  private readonly userSignal = signal<User | null>(this.getStoredUser());

  readonly token = computed(() => this.tokenSignal());
  readonly user = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => !!this.tokenSignal() && !!this.userSignal());
  readonly role = computed(() => this.userSignal()?.role ?? null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  login(payload: LoginPayload): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => this.saveSession(response.data.token, response.data.user)),
      map((response) => response.data.user)
    );
  }

  // 🔥 MÉTODO MODIFICADO (NO guarda sesión automáticamente)
  register(payload: RegisterPayload): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      map((response) => response.data.user)
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`).pipe(
      tap((response) => {
        this.userSignal.set(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }),
      map((response) => response.data)
    );
  }

  saveSession(token: string, user: User): void {
    this.tokenSignal.set(token);
    this.userSignal.set(user);

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  getCurrentUser(): User | null {
    return this.userSignal();
  }

  getRole(): UserRole | null {
    return this.userSignal()?.role ?? null;
  }

  redirectByRole(role?: UserRole | null): void {
    const currentRole = role ?? this.getRole();

    switch (currentRole) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'medico':
        this.router.navigate(['/medico/dashboard']);
        break;
      case 'paciente':
        this.router.navigate(['/paciente/dashboard']);
        break;
      default:
        this.router.navigate(['/auth/login']);
        break;
    }
  }

  private getStoredUser(): User | null {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      return null;
    }
  }
}
