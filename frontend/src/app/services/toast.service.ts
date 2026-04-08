import { Injectable, signal, computed } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private nextId = 0;

  readonly toastsList = computed(() => this.toasts());

  showSuccess(message: string, durationMs: number = 3000): void {
    this.addToast(message, 'success', durationMs);
  }

  showError(message: string, durationMs: number = 5000): void {
    this.addToast(message, 'error', durationMs);
  }

  showWarning(message: string, durationMs: number = 4000): void {
    this.addToast(message, 'warning', durationMs);
  }

  showInfo(message: string, durationMs: number = 3000): void {
    this.addToast(message, 'info', durationMs);
  }

  removeToast(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  private addToast(message: string, type: Toast['type'], durationMs: number): void {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type
    };
    this.toasts.update(toasts => [...toasts, toast]);

    // Auto-remove after duration
    setTimeout(() => this.removeToast(toast.id), durationMs);
  }
}
