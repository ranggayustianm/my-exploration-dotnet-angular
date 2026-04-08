import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { InventoryItem, CreateInventoryItemDto, UpdateInventoryItemDto } from '../models/inventory-item.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly apiUrl = 'http://localhost:5268/api/inventory';
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  // Signals for reactive state management
  private readonly inventoryItems = signal<InventoryItem[]>([]);
  private readonly loading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);
  private readonly searchTerm = signal<string>('');
  private readonly selectedCategory = signal<string>('');

  // Computed signals
  readonly items = computed(() => {
    const items = this.inventoryItems();
    const search = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();

    let filtered = items;

    // Filter by search term (name or description)
    if (search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
      );
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter(item => item.category === category);
    }

    return filtered;
  });

  readonly allCategories = computed(() => {
    const items = this.inventoryItems();
    const categories = new Set(items.map(item => item.category).filter(Boolean));
    return Array.from(categories).sort();
  });

  // Dashboard stats
  readonly totalItems = computed(() => this.inventoryItems().length);

  readonly totalValue = computed(() =>
    this.inventoryItems().reduce((sum, item) => sum + (item.price * item.quantity), 0)
  );

  readonly lowStockItems = computed(() =>
    this.inventoryItems().filter(item => item.quantity < 10)
      .sort((a, b) => a.quantity - b.quantity)
  );

  readonly itemsByCategory = computed(() => {
    const items = this.inventoryItems();
    const map = new Map<string, number>();
    items.forEach(item => {
      const cat = item.category || 'Uncategorized';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  });

  readonly recentItems = computed(() =>
    [...this.inventoryItems()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );

  readonly isLoading = computed(() => this.loading());
  readonly errorMessage = computed(() => this.error());
  readonly currentSearchTerm = computed(() => this.searchTerm());
  readonly currentSelectedCategory = computed(() => this.selectedCategory());

  // Search and filter methods
  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  setSelectedCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('');
  }

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

    return this.http.get<InventoryItem[]>(this.apiUrl).pipe(
      tap(items => this.setItems(items)),
      catchError(() => this.handleError('Failed to fetch inventory items'))
    );
  }

  // Get a single inventory item by ID
  getInventoryItemById(id: number): Observable<InventoryItem> {
    this.startRequest();

    return this.http.get<InventoryItem>(`${this.apiUrl}/${id}`).pipe(
      tap(item => this.setItems([item])),
      catchError(() => this.handleError('Failed to fetch inventory item'))
    );
  }

  // Create a new inventory item
  createInventoryItem(item: CreateInventoryItemDto): Observable<InventoryItem> {
    this.startRequest();

    return this.http.post<InventoryItem>(this.apiUrl, item).pipe(
      tap(newItem => {
        this.addItem(newItem);
        this.toast.showSuccess(`"${newItem.name}" has been added to inventory`);
      }),
      catchError(() => this.handleError('Failed to create inventory item'))
    );
  }

  // Update an existing inventory item
  updateInventoryItem(id: number, item: UpdateInventoryItemDto): Observable<InventoryItem> {
    this.startRequest();

    return this.http.put<InventoryItem>(`${this.apiUrl}/${id}`, item).pipe(
      tap(updatedItem => {
        this.updateItem(updatedItem);
        this.toast.showSuccess(`"${updatedItem.name}" has been updated`);
      }),
      catchError(() => this.handleError('Failed to update inventory item'))
    );
  }

  // Delete an inventory item
  deleteInventoryItem(id: number): Observable<void> {
    this.startRequest();

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.removeItem(id);
        this.toast.showSuccess('Item has been removed from inventory');
      }),
      catchError(() => this.handleError('Failed to delete inventory item'))
    );
  }

  // Clear error message
  clearError(): void {
    this.error.set(null);
  }
}
