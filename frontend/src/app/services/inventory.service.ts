import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, finalize } from 'rxjs';
import { InventoryItem, CreateInventoryItemDto, UpdateInventoryItemDto } from '../models/inventory-item.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly apiUrl = 'http://localhost:5000/api/inventory';
  private readonly http = inject(HttpClient);

  // Signals for reactive state management
  private readonly inventoryItems = signal<InventoryItem[]>([]);
  private readonly loading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);

  // Computed signals
  readonly items = computed(() => this.inventoryItems());
  readonly isLoading = computed(() => this.loading());
  readonly errorMessage = computed(() => this.error());

  // Get all inventory items
  getInventoryItems(): Observable<InventoryItem[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<InventoryItem[]>(this.apiUrl).pipe(
      tap(items => {
        this.inventoryItems.set(items);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to fetch inventory items');
        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  // Get a single inventory item by ID
  getInventoryItemById(id: number): Observable<InventoryItem> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<InventoryItem>(`${this.apiUrl}/${id}`).pipe(
      tap(item => {
        this.inventoryItems.set([item]);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to fetch inventory item');
        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  // Create a new inventory item
  createInventoryItem(item: CreateInventoryItemDto): Observable<InventoryItem> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<InventoryItem>(this.apiUrl, item).pipe(
      tap(newItem => {
        this.inventoryItems.update(items => [...items, newItem]);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to create inventory item');
        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  // Update an existing inventory item
  updateInventoryItem(id: number, item: UpdateInventoryItemDto): Observable<InventoryItem> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<InventoryItem>(`${this.apiUrl}/${id}`, item).pipe(
      tap(updatedItem => {
        this.inventoryItems.update(items =>
          items.map(i => i.id === id ? updatedItem : i)
        );
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to update inventory item');
        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  // Delete an inventory item
  deleteInventoryItem(id: number): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.inventoryItems.update(items => items.filter(i => i.id !== id));
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to delete inventory item');
        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  // Clear error message
  clearError(): void {
    this.error.set(null);
  }

  // Set loading state
  setLoading(loading: boolean): void {
    this.loading.set(loading);
  }
}