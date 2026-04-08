import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../models/inventory-item.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.css'
})
export class InventoryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // DRY: Use service's computed signals directly instead of duplicating state
  items = this.inventoryService.items;
  loading = this.inventoryService.isLoading;
  error = this.inventoryService.errorMessage;

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

  deleteItem(id: number): void {
    if (confirm('Are you sure you want to delete this item?')) {
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  clearError(): void {
    this.inventoryService.clearError();
  }
}
