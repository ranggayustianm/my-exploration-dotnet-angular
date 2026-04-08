import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { RegisterUserDto, LoginUserDto, AuthResponseDto, CurrentUser } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5268/api/auth';
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'currentUser';

  // Signals for reactive state management
  private readonly currentUserSignal = signal<CurrentUser | null>(this.loadUserFromStorage());
  private readonly loading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);

  // Computed signals
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isLoading = computed(() => this.loading());
  readonly errorMessage = computed(() => this.error());

  private loadUserFromStorage(): CurrentUser | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : null;
  }

  private saveUserToStorage(user: CurrentUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    }
  }

  private clearUserFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  private startRequest(): void {
    this.loading.set(true);
    this.error.set(null);
  }

  private handleError(errorMessage: string) {
    this.error.set(errorMessage);
    this.loading.set(false);
    return throwError(() => new Error(errorMessage));
  }

  register(dto: RegisterUserDto): Observable<AuthResponseDto> {
    this.startRequest();

    return this.http.post<AuthResponseDto>(`${this.apiUrl}/register`, dto).pipe(
      tap(response => {
        const user: CurrentUser = {
          username: response.username,
          email: response.email,
          token: response.token
        };
        this.currentUserSignal.set(user);
        this.saveUserToStorage(user);
        this.loading.set(false);
      }),
      catchError((err) => {
        const message = err.error?.message || 'Registration failed';
        return this.handleError(message);
      })
    );
  }

  login(dto: LoginUserDto): Observable<AuthResponseDto> {
    this.startRequest();

    return this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, dto).pipe(
      tap(response => {
        const user: CurrentUser = {
          username: response.username,
          email: response.email,
          token: response.token
        };
        this.currentUserSignal.set(user);
        this.saveUserToStorage(user);
        this.loading.set(false);
      }),
      catchError((err) => {
        const message = err.error?.message || 'Invalid username/email or password';
        return this.handleError(message);
      })
    );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.clearUserFromStorage();
    this.error.set(null);
  }

  clearError(): void {
    this.error.set(null);
  }
}
