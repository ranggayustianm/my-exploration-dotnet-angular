export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  category: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

// Omit server-managed fields
export type CreateInventoryItemDto = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInventoryItemDto = Partial<CreateInventoryItemDto>;