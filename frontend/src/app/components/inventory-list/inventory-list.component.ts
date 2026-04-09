import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../models/inventory-item.model';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.css'
})
export class InventoryListComponent implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly fb = inject(FormBuilder);

  // DRY: Use service's computed signals directly instead of duplicating state
  items = this.inventoryService.items;
  loading = this.inventoryService.isLoading;
  error = this.inventoryService.errorMessage;
  allCategories = this.inventoryService.allCategories;
  searchTerm = this.inventoryService.currentSearchTerm;
  selectedCategory = this.inventoryService.currentSelectedCategory;

  showForm = false;
  editingItem: InventoryItem | null = null;
  itemForm!: FormGroup;

  ngOnInit(): void {
    this.loadInventoryItems();
    this.initForm();
  }

  private initForm(): void {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      category: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadInventoryItems(): void {
    this.inventoryService.getInventoryItems().subscribe({
      error: (err) => console.error('Error loading items:', err)
    });
  }

  openAddForm(): void {
    this.showForm = true;
    this.editingItem = null;
    this.initForm();
  }

  openEditForm(item: InventoryItem): void {
    this.showForm = true;
    this.editingItem = item;
    this.itemForm = this.fb.group({
      name: [item.name, [Validators.required, Validators.minLength(1)]],
      description: [item.description],
      category: [item.category],
      quantity: [item.quantity, [Validators.required, Validators.min(0)]],
      price: [item.price, [Validators.required, Validators.min(0)]]
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.editingItem = null;
    this.initForm();
  }

  saveItem(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formValue = this.itemForm.value;

    if (this.editingItem) {
      // Update existing item
      this.inventoryService.updateInventoryItem(this.editingItem.id, formValue).subscribe({
        next: () => this.closeForm(),
        error: (err) => console.error('Error updating item:', err)
      });
    } else {
      // Create new item
      this.inventoryService.createInventoryItem(formValue).subscribe({
        next: () => this.closeForm(),
        error: (err) => console.error('Error creating item:', err)
      });
    }
  }

  deleteItem(id: number, itemName: string): void {
    if (confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      this.inventoryService.deleteInventoryItem(id).subscribe({
        error: (err) => console.error('Error deleting item:', err)
      });
    }
  }

  formatCurrency(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  clearError(): void {
    this.inventoryService.clearError();
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inventoryService.setSearchTerm(value);
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.inventoryService.setSelectedCategory(value);
  }

  clearFilters(): void {
    this.inventoryService.clearFilters();
  }
}
