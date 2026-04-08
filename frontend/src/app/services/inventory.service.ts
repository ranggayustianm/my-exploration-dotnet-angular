import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { InventoryItem, CreateInventoryItemDto, UpdateInventoryItemDto } from '../models/inventory-item.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly apiUrl = 'http://localhost:5268/api/inventory';
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  // DRY: Helper method to get auth headers
  private getAuthHeaders(): HttpHeaders {
    const user = this.authService.currentUser();
    const token = user?.token;
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Signals for reactive state management
  private readonly inventoryItems = signal<InventoryItem[]>([]);
  private readonly loading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);

  // Computed signals
  readonly items = computed(() => this.inventoryItems());
  readonly isLoading = computed(() => this.loading());
  readonly errorMessage = computed(() => this.error());

  // DRY: Private helper methods to eliminate repeated code
  private startRequest(): void {
    this.loading.set(true);
    this.error.set(null);
  }

  private handleError(errorMessage: string) {
    this.error.set(errorMessage);
    this.loading.set(false);
    return throwError(() => new Error(errorMessage));
  }

  private setItems(items: InventoryItem[]): void {
    this.inventoryItems.set(items);
    this.loading.set(false);
  }

  private addItem(newItem: InventoryItem): void {
    this.inventoryItems.update(items => [...items, newItem]);
    this.loading.set(false);
  }

  private updateItem(updatedItem: InventoryItem): void {
    this.inventoryItems.update(items =>
      items.map(i => i.id === updatedItem.id ? updatedItem : i)
    );
    this.loading.set(false);
  }

  private removeItem(id: number): void {
    this.inventoryItems.update(items => items.filter(i => i.id !== id));
    this.loading.set(false);
  }

  // Get all inventory items
  getInventoryItems(): Observable<InventoryItem[]> {
    this.startRequest();

    return this.http.get<InventoryItem[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      tap(items => this.setItems(items)),
      catchError(() => this.handleError('Failed to fetch inventory items'))
    );
  }

  // Get a single inventory item by ID
  getInventoryItemById(id: number): Observable<InventoryItem> {
    this.startRequest();

    return this.http.get<InventoryItem>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      tap(item => this.setItems([item])),
      catchError(() => this.handleError('Failed to fetch inventory item'))
    );
  }

  // Create a new inventory item
  createInventoryItem(item: CreateInventoryItemDto): Observable<InventoryItem> {
    this.startRequest();

    return this.http.post<InventoryItem>(this.apiUrl, item, { headers: this.getAuthHeaders() }).pipe(
      tap(newItem => this.addItem(newItem)),
      catchError(() => this.handleError('Failed to create inventory item'))
    );
  }

  // Update an existing inventory item
  updateInventoryItem(id: number, item: UpdateInventoryItemDto): Observable<InventoryItem> {
    this.startRequest();

    return this.http.put<InventoryItem>(`${this.apiUrl}/${id}`, item, { headers: this.getAuthHeaders() }).pipe(
      tap(updatedItem => this.updateItem(updatedItem)),
      catchError(() => this.handleError('Failed to update inventory item'))
    );
  }

  // Delete an inventory item
  deleteInventoryItem(id: number): Observable<void> {
    this.startRequest();

    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.removeItem(id)),
      catchError(() => this.handleError('Failed to delete inventory item'))
    );
  }

  // Clear error message
  clearError(): void {
    this.error.set(null);
  }
}
