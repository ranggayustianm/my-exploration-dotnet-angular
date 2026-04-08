import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InventoryListComponent } from './components/inventory-list/inventory-list.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inventory', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'inventory', 
    component: InventoryListComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'inventory' }
];
