import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { AuthService } from '../../services/auth.service';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Stats from service
  totalItems = this.inventoryService.totalItems;
  totalValue = this.inventoryService.totalValue;
  lowStockItems = this.inventoryService.lowStockItems;
  itemsByCategory = this.inventoryService.itemsByCategory;
  recentItems = this.inventoryService.recentItems;
  loading = this.inventoryService.isLoading;

  ngOnInit(): void {
    this.inventoryService.getInventoryItems().subscribe({
      error: (err) => console.error('Error loading items:', err)
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  navigateToInventory(): void {
    this.router.navigate(['/inventory']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
