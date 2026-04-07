import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { InventoryListComponent } from './inventory-list.component';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../models/inventory-item.model';

describe('InventoryListComponent', () => {
  let component: InventoryListComponent;
  let fixture: ComponentFixture<InventoryListComponent>;
  let inventoryService: InventoryService;

  const mockInventoryItems: InventoryItem[] = [
    {
      id: 1,
      name: 'Test Item 1',
      description: 'Test Description 1',
      quantity: 10,
      category: 'Electronics',
      price: 99.99,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      name: 'Test Item 2',
      description: 'Test Description 2',
      quantity: 5,
      category: 'Books',
      price: 29.99,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        InventoryService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryListComponent);
    component = fixture.componentInstance;
    inventoryService = TestBed.inject(InventoryService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty items and default values', () => {
    expect(component.items).toEqual([]);
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('');
    expect(component.showForm).toBeFalse();
    expect(component.editingItem).toBeNull();
  });

  describe('loadInventoryItems', () => {
    it('should load inventory items on init', () => {
      expect(component.items).toEqual([]);
    });

    it('should set loading to false after error', () => {
      spyOn(inventoryService, 'getInventoryItems').and.returnValue({
        subscribe: (callbacks: any) => {
          callbacks.error({ status: 500 });
        }
      } as any);

      component.loadInventoryItems();
      expect(component.loading).toBeFalse();
      expect(component.error).toBe('Failed to load inventory items');
    });
  });

  describe('openAddForm', () => {
    it('should open add form with empty model', () => {
      component.openAddForm();

      expect(component.showForm).toBeTrue();
      expect(component.editingItem).toBeNull();
      expect(component.formModel.name).toBe('');
      expect(component.formModel.description).toBe('');
      expect(component.formModel.quantity).toBe(0);
      expect(component.formModel.category).toBe('');
      expect(component.formModel.price).toBe(0);
    });
  });

  describe('openEditForm', () => {
    it('should open edit form with item data', () => {
      const testItem = mockInventoryItems[0];
      component.openEditForm(testItem);

      expect(component.showForm).toBeTrue();
      expect(component.editingItem).toEqual(testItem);
      expect(component.formModel.name).toBe(testItem.name);
      expect(component.formModel.description).toBe(testItem.description);
      expect(component.formModel.quantity).toBe(testItem.quantity);
      expect(component.formModel.category).toBe(testItem.category);
      expect(component.formModel.price).toBe(testItem.price);
    });
  });

  describe('closeForm', () => {
    it('should close form and reset model', () => {
      component.showForm = true;
      component.editingItem = mockInventoryItems[0];
      component.formModel = { ...mockInventoryItems[0] };

      component.closeForm();

      expect(component.showForm).toBeFalse();
      expect(component.editingItem).toBeNull();
      expect(component.formModel.name).toBe('');
      expect(component.formModel.description).toBe('');
      expect(component.formModel.quantity).toBe(0);
      expect(component.formModel.category).toBe('');
      expect(component.formModel.price).toBe(0);
    });
  });

  describe('saveItem', () => {
    it('should create new item when not editing', () => {
      const newItem = {
        name: 'New Item',
        description: 'New Description',
        quantity: 15,
        category: 'Tools',
        price: 49.99
      };
      component.formModel = newItem;
      component.editingItem = null;

      spyOn(inventoryService, 'createInventoryItem').and.returnValue({
        subscribe: (callbacks: any) => {
          callbacks.next({ ...newItem, id: 3, createdAt: new Date(), updatedAt: new Date() });
        }
      } as any);

      component.saveItem();

      expect(inventoryService.createInventoryItem).toHaveBeenCalledWith(newItem);
      expect(component.showForm).toBeFalse();
    });

    it('should update item when editing', () => {
      const updatedItem = {
        id: 1,
        name: 'Updated Item',
        description: 'Updated Description',
        quantity: 20,
        category: 'Updated Category',
        price: 79.99,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      };
      component.editingItem = mockInventoryItems[0];
      component.formModel = updatedItem;
      component.items = [...mockInventoryItems];

      spyOn(inventoryService, 'updateInventoryItem').and.returnValue({
        subscribe: (callbacks: any) => {
          callbacks.next(updatedItem);
        }
      } as any);

      component.saveItem();

      expect(inventoryService.updateInventoryItem).toHaveBeenCalledWith(1, updatedItem);
      expect(component.showForm).toBeFalse();
    });
  });

  describe('deleteItem', () => {
    it('should delete item after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.items = [...mockInventoryItems];

      spyOn(inventoryService, 'deleteInventoryItem').and.returnValue({
        subscribe: (callbacks: any) => {
          callbacks.next();
        }
      } as any);

      component.deleteItem(1);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this item?');
      expect(inventoryService.deleteInventoryItem).toHaveBeenCalledWith(1);
      expect(component.items.length).toBe(1);
      expect(component.items.find(i => i.id === 1)).toBeUndefined();
    });

    it('should not delete item if confirmation is cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.items = [...mockInventoryItems];

      component.deleteItem(1);

      expect(window.confirm).toHaveBeenCalled();
      expect(inventoryService.deleteInventoryItem).not.toHaveBeenCalled();
    });
  });

  describe('formatCurrency', () => {
    it('should format price as USD currency', () => {
      const formatted = component.formatCurrency(99.99);
      expect(formatted).toBe('$99.99');
    });

    it('should format zero price', () => {
      const formatted = component.formatCurrency(0);
      expect(formatted).toBe('$0.00');
    });

    it('should format large prices', () => {
      const formatted = component.formatCurrency(1234.56);
      expect(formatted).toBe('$1,234.56');
    });
  });
});