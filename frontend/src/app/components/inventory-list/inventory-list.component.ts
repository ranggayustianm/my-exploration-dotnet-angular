import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem, CreateInventoryItemDto, UpdateInventoryItemDto } from '../../models/inventory-item.model';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.css'
})
export class InventoryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);

  items: InventoryItem[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingItem: InventoryItem | null = null;
  formModel: CreateInventoryItemDto | UpdateInventoryItemDto = {
    name: '',
    description: '',
    quantity: 0,
    category: '',
    price: 0
  };

  ngOnInit(): void {
    this.loadInventoryItems();
  }

  loadInventoryItems(): void {
    this.loading = true;
    this.inventoryService.getInventoryItems().subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load inventory items';
        this.loading = false;
        console.error('Error loading items:', error);
      }
    });
  }

  openAddForm(): void {
    this.showForm = true;
    this.editingItem = null;
    this.formModel = {
      name: '',
      description: '',
      quantity: 0,
      category: '',
      price: 0
    };
  }

  openEditForm(item: InventoryItem): void {
    this.showForm = true;
    this.editingItem = item;
    this.formModel = { ...item };
  }

  closeForm(): void {
    this.showForm = false;
    this.editingItem = null;
    this.formModel = {
      name: '',
      description: '',
      quantity: 0,
      category: '',
      price: 0
    };
  }

  saveItem(): void {
    if (this.editingItem) {
      // Update existing item
      this.inventoryService.updateInventoryItem(this.editingItem.id, this.formModel as UpdateInventoryItemDto).subscribe({
        next: (updatedItem) => {
          this.items = this.items.map(item =>
            item.id === updatedItem.id ? updatedItem : item
          );
          this.closeForm();
        },
        error: (error) => {
          this.error = 'Failed to update item';
          console.error('Error updating item:', error);
        }
      });
    } else {
      // Create new item
      this.inventoryService.createInventoryItem(this.formModel as CreateInventoryItemDto).subscribe({
        next: (newItem) => {
          this.items = [...this.items, newItem];
          this.closeForm();
        },
        error: (error) => {
          this.error = 'Failed to create item';
          console.error('Error creating item:', error);
        }
      });
    }
  }

  deleteItem(id: number): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.inventoryService.deleteInventoryItem(id).subscribe({
        next: () => {
          this.items = this.items.filter(item => item.id !== id);
        },
        error: (error) => {
          this.error = 'Failed to delete item';
          console.error('Error deleting item:', error);
        }
      });
    }
  }

  formatCurrency(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}