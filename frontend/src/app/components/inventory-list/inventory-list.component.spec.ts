import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { InventoryListComponent } from './inventory-list.component';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../models/inventory-item.model';
import { of, throwError } from 'rxjs';

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
      imports: [InventoryListComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        InventoryService,
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryListComponent);
    component = fixture.componentInstance;
    inventoryService = TestBed.inject(InventoryService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call loadInventoryItems and initForm on init', () => {
      spyOn(component, 'loadInventoryItems');
      spyOn<any>(component, 'initForm');

      component.ngOnInit();

      expect(component.loadInventoryItems).toHaveBeenCalled();
      expect((component as any).initForm).toHaveBeenCalled();
    });
  });

  describe('signals from service', () => {
    it('should reflect service items signal', () => {
      expect(component.items()).toEqual([]);
    });

    it('should reflect service loading signal', () => {
      expect(component.loading()).toBe(false);
    });

    it('should reflect service error message signal', () => {
      expect(component.error()).toBeNull();
    });
  });

  describe('loadInventoryItems', () => {
    it('should load inventory items from service', () => {
      spyOn(inventoryService, 'getInventoryItems').and.returnValue(of(mockInventoryItems));

      component.loadInventoryItems();

      expect(inventoryService.getInventoryItems).toHaveBeenCalled();
    });

    it('should handle error when loading items fails', () => {
      const consoleSpy = spyOn(console, 'error');
      spyOn(inventoryService, 'getInventoryItems').and.returnValue(throwError(() => new Error('Failed')));

      component.loadInventoryItems();

      expect(consoleSpy).toHaveBeenCalledWith('Error loading items:', jasmine.anything());
    });
  });

  describe('openAddForm', () => {
    it('should open add form with empty model and reset form', () => {
      component.openAddForm();

      expect(component.showForm).toBeTrue();
      expect(component.editingItem).toBeNull();
      expect(component.itemForm).toBeDefined();
      expect(component.itemForm.get('name')?.value).toBe('');
      expect(component.itemForm.get('description')?.value).toBe('');
      expect(component.itemForm.get('quantity')?.value).toBe(0);
      expect(component.itemForm.get('category')?.value).toBe('');
      expect(component.itemForm.get('price')?.value).toBe(0);
    });
  });

  describe('openEditForm', () => {
    it('should open edit form with item data', () => {
      const testItem = mockInventoryItems[0];
      component.openEditForm(testItem);

      expect(component.showForm).toBeTrue();
      expect(component.editingItem).toEqual(testItem);
      expect(component.itemForm).toBeDefined();
      expect(component.itemForm.get('name')?.value).toBe(testItem.name);
      expect(component.itemForm.get('description')?.value).toBe(testItem.description);
      expect(component.itemForm.get('quantity')?.value).toBe(testItem.quantity);
      expect(component.itemForm.get('category')?.value).toBe(testItem.category);
      expect(component.itemForm.get('price')?.value).toBe(testItem.price);
    });
  });

  describe('closeForm', () => {
    it('should close form and reset editing state', () => {
      component.showForm = true;
      component.editingItem = mockInventoryItems[0];

      component.closeForm();

      expect(component.showForm).toBeFalse();
      expect(component.editingItem).toBeNull();
      expect(component.itemForm).toBeDefined();
    });
  });

  describe('saveItem', () => {
    it('should not save when form is invalid', () => {
      component.itemForm = TestBed.inject(FormBuilder).group({
        name: [''],
        description: [''],
        category: [''],
        quantity: [0],
        price: [0]
      });
      component.editingItem = null;

      const createSpy = spyOn(inventoryService, 'createInventoryItem');
      
      component.saveItem();

      expect(component.itemForm.invalid).toBeTrue();
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('should create new item when not editing', () => {
      const newItem = {
        name: 'New Item',
        description: 'New Description',
        quantity: 15,
        category: 'Tools',
        price: 49.99
      };
      component.itemForm = TestBed.inject(FormBuilder).group({
        name: [newItem.name],
        description: [newItem.description],
        category: [newItem.category],
        quantity: [newItem.quantity],
        price: [newItem.price]
      });
      component.editingItem = null;

      spyOn(inventoryService, 'createInventoryItem').and.returnValue(of({ ...newItem, id: 3, createdAt: new Date(), updatedAt: new Date() }));
      spyOn(component, 'closeForm');

      component.saveItem();

      expect(inventoryService.createInventoryItem).toHaveBeenCalledWith(jasmine.objectContaining(newItem));
      expect(component.closeForm).toHaveBeenCalled();
    });

    it('should update item when editing', () => {
      const updatedItem = {
        id: 1,
        name: 'Updated Item',
        description: 'Updated Description',
        quantity: 20,
        category: 'Updated Category',
        price: 79.99
      };
      component.editingItem = mockInventoryItems[0];
      component.itemForm = TestBed.inject(FormBuilder).group({
        name: [updatedItem.name],
        description: [updatedItem.description],
        category: [updatedItem.category],
        quantity: [updatedItem.quantity],
        price: [updatedItem.price]
      });

      spyOn(inventoryService, 'updateInventoryItem').and.returnValue(of({ ...updatedItem, createdAt: new Date('2024-01-01'), updatedAt: new Date() }));
      spyOn(component, 'closeForm');

      component.saveItem();

      expect(inventoryService.updateInventoryItem).toHaveBeenCalledWith(1, jasmine.objectContaining(updatedItem));
      expect(component.closeForm).toHaveBeenCalled();
    });

    it('should handle error when creating item', () => {
      const consoleSpy = spyOn(console, 'error');
      component.itemForm = TestBed.inject(FormBuilder).group({
        name: ['New Item'],
        description: [''],
        category: [''],
        quantity: [10],
        price: [9.99]
      });
      component.editingItem = null;

      spyOn(inventoryService, 'createInventoryItem').and.returnValue(throwError(() => new Error('Failed')));

      component.saveItem();

      expect(consoleSpy).toHaveBeenCalledWith('Error creating item:', jasmine.anything());
    });

    it('should handle error when updating item', () => {
      const consoleSpy = spyOn(console, 'error');
      component.editingItem = mockInventoryItems[0];
      component.itemForm = TestBed.inject(FormBuilder).group({
        name: ['Updated Item'],
        description: [''],
        category: [''],
        quantity: [10],
        price: [9.99]
      });

      spyOn(inventoryService, 'updateInventoryItem').and.returnValue(throwError(() => new Error('Failed')));

      component.saveItem();

      expect(consoleSpy).toHaveBeenCalledWith('Error updating item:', jasmine.anything());
    });
  });

  describe('deleteItem', () => {
    it('should delete item after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      spyOn(inventoryService, 'deleteInventoryItem').and.returnValue(of(undefined));

      component.deleteItem(1);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this item?');
      expect(inventoryService.deleteInventoryItem).toHaveBeenCalledWith(1);
    });

    it('should not delete item if confirmation is cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      const deleteSpy = spyOn(inventoryService, 'deleteInventoryItem');

      component.deleteItem(1);

      expect(window.confirm).toHaveBeenCalled();
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should handle error when deleting item', () => {
      const consoleSpy = spyOn(console, 'error');
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(inventoryService, 'deleteInventoryItem').and.returnValue(throwError(() => new Error('Failed')));

      component.deleteItem(1);

      expect(consoleSpy).toHaveBeenCalledWith('Error deleting item:', jasmine.anything());
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

    it('should format large prices with commas', () => {
      const formatted = component.formatCurrency(1234.56);
      expect(formatted).toBe('$1,234.56');
    });
  });

  describe('clearError', () => {
    it('should call service clearError method', () => {
      const clearErrorSpy = spyOn(inventoryService, 'clearError');

      component.clearError();

      expect(clearErrorSpy).toHaveBeenCalled();
    });
  });
});