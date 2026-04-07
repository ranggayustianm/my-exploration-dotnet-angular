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

export interface CreateInventoryItemDto {
  name: string;
  description: string;
  quantity: number;
  category: string;
  price: number;
}

export interface UpdateInventoryItemDto {
  name: string;
  description: string;
  quantity: number;
  category: string;
  price: number;
}