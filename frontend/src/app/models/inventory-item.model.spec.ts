import { InventoryItem, CreateInventoryItemDto, UpdateInventoryItemDto } from './inventory-item.model';

describe('InventoryItem Model', () => {
  const baseItem: InventoryItem = {
    id: 1,
    name: 'Test Item',
    description: 'Test Description',
    quantity: 10,
    category: 'Electronics',
    price: 99.99,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  describe('InventoryItem interface', () => {
    it('should have all required properties', () => {
      expect(baseItem.id).toBe(1);
      expect(baseItem.name).toBe('Test Item');
      expect(baseItem.description).toBe('Test Description');
      expect(baseItem.quantity).toBe(10);
      expect(baseItem.category).toBe('Electronics');
      expect(baseItem.price).toBe(99.99);
      expect(baseItem.createdAt).toBeInstanceOf(Date);
      expect(baseItem.updatedAt).toBeInstanceOf(Date);
    });

    it('should allow different values for each property', () => {
      const item: InventoryItem = {
        id: 2,
        name: 'Another Item',
        description: 'Another Description',
        quantity: 5,
        category: 'Books',
        price: 29.99,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      };

      expect(item.id).toBe(2);
      expect(item.name).toBe('Another Item');
      expect(item.category).toBe('Books');
    });
  });

  describe('CreateInventoryItemDto type', () => {
    it('should not include id, createdAt, or updatedAt', () => {
      const createDto: CreateInventoryItemDto = {
        name: 'New Item',
        description: 'New Description',
        quantity: 15,
        category: 'Tools',
        price: 49.99
      };

      expect(createDto.name).toBe('New Item');
      expect(createDto.quantity).toBe(15);
      expect((createDto as any).id).toBeUndefined();
      expect((createDto as any).createdAt).toBeUndefined();
      expect((createDto as any).updatedAt).toBeUndefined();
    });

    it('should require all fields except id and timestamps', () => {
      const createDto: CreateInventoryItemDto = {
        name: 'Required Fields Item',
        description: '',
        quantity: 0,
        category: '',
        price: 0
      };

      expect(createDto.name).toBeDefined();
      expect(createDto.quantity).toBeDefined();
      expect(createDto.price).toBeDefined();
    });
  });

  describe('UpdateInventoryItemDto type', () => {
    it('should be partial (all fields optional)', () => {
      const updateDto: UpdateInventoryItemDto = {
        name: 'Updated Name'
      };

      expect(updateDto.name).toBe('Updated Name');
      expect(updateDto.quantity).toBeUndefined();
      expect(updateDto.price).toBeUndefined();
    });

    it('should allow updating multiple fields', () => {
      const updateDto: UpdateInventoryItemDto = {
        name: 'Updated Name',
        quantity: 100,
        price: 199.99
      };

      expect(updateDto.name).toBe('Updated Name');
      expect(updateDto.quantity).toBe(100);
      expect(updateDto.price).toBe(199.99);
    });

    it('should allow empty update object', () => {
      const updateDto: UpdateInventoryItemDto = {};
      expect(Object.keys(updateDto).length).toBe(0);
    });
  });
});
