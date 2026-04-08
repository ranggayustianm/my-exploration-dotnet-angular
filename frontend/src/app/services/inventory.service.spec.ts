import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InventoryService } from './inventory.service';
import { InventoryItem, CreateInventoryItemDto, UpdateInventoryItemDto } from '../models/inventory-item.model';
import { of } from 'rxjs';

describe('InventoryService', () => {
  let service: InventoryService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:5268/api/inventory';

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InventoryService]
    });

    service = TestBed.inject(InventoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getInventoryItems', () => {
    it('should return inventory items and update signals', (done) => {
      expect(service.isLoading()).toBe(false);
      expect(service.errorMessage()).toBeNull();

      service.getInventoryItems().subscribe(items => {
        expect(items).toEqual(mockInventoryItems);
        expect(service.items()).toEqual(mockInventoryItems);
        expect(service.isLoading()).toBe(false);
        expect(service.errorMessage()).toBeNull();
        done();
      });

      expect(service.isLoading()).toBe(true);

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockInventoryItems);
    });

    it('should handle error when fetching items fails', (done) => {
      service.getInventoryItems().subscribe({
        next: () => fail('Expected an error, not items'),
        error: (error) => {
          expect(error.message).toBe('Failed to fetch inventory items');
          expect(service.errorMessage()).toBe('Failed to fetch inventory items');
          expect(service.isLoading()).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Server error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getInventoryItemById', () => {
    it('should return a single inventory item', (done) => {
      const testItem = mockInventoryItems[0];

      service.getInventoryItemById(1).subscribe(item => {
        expect(item).toEqual(testItem);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(testItem);
    });

    it('should handle error when fetching item by id fails', (done) => {
      service.getInventoryItemById(1).subscribe({
        next: () => fail('Expected an error, not item'),
        error: (error) => {
          expect(error.message).toBe('Failed to fetch inventory item');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createInventoryItem', () => {
    it('should create a new inventory item and update signals', (done) => {
      const newItem: CreateInventoryItemDto = {
        name: 'New Item',
        description: 'New Description',
        quantity: 15,
        category: 'Tools',
        price: 49.99
      };

      const createdItem: InventoryItem = {
        ...newItem,
        id: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.createInventoryItem(newItem).subscribe(item => {
        expect(item).toEqual(createdItem);
        expect(service.items()).toContain(jasmine.objectContaining(newItem));
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newItem);
      req.flush(createdItem);
    });

    it('should handle error when creating item fails', (done) => {
      const newItem: CreateInventoryItemDto = {
        name: 'New Item',
        description: 'New Description',
        quantity: 15,
        category: 'Tools',
        price: 49.99
      };

      service.createInventoryItem(newItem).subscribe({
        next: () => fail('Expected an error, not item'),
        error: (error) => {
          expect(error.message).toBe('Failed to create inventory item');
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Conflict', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('updateInventoryItem', () => {
    it('should update an existing inventory item and update signals', (done) => {
      const updatedItem: UpdateInventoryItemDto = {
        name: 'Updated Item',
        description: 'Updated Description',
        quantity: 20,
        category: 'Updated Category',
        price: 79.99
      };

      const responseItem: InventoryItem = {
        ...updatedItem,
        id: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      };

      service.updateInventoryItem(1, updatedItem).subscribe(item => {
        expect(item).toEqual(responseItem);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedItem);
      req.flush(responseItem);
    });

    it('should handle error when updating item fails', (done) => {
      const updatedItem: UpdateInventoryItemDto = {
        name: 'Updated Item',
        description: 'Updated Description',
        quantity: 20,
        category: 'Updated Category',
        price: 79.99
      };

      service.updateInventoryItem(1, updatedItem).subscribe({
        next: () => fail('Expected an error, not item'),
        error: (error) => {
          expect(error.message).toBe('Failed to update inventory item');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteInventoryItem', () => {
    it('should delete an inventory item and update signals', (done) => {
      // First add an item to the list
      service['inventoryItems'].set([...mockInventoryItems]);
      expect(service.items().length).toBe(2);

      service.deleteInventoryItem(1).subscribe(response => {
        expect(response).toBeUndefined();
        expect(service.items().length).toBe(1);
        expect(service.items().find(i => i.id === 1)).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle error when deleting item fails', (done) => {
      service.deleteInventoryItem(1).subscribe({
        next: () => fail('Expected an error, not success'),
        error: (error) => {
          expect(error.message).toBe('Failed to delete inventory item');
          done();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('clearError', () => {
    it('should clear the error message', () => {
      // First trigger an error
      service.getInventoryItems().subscribe();
      const req = httpMock.expectOne(apiUrl);
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(service.errorMessage()).toBe('Failed to fetch inventory items');

      service.clearError();
      expect(service.errorMessage()).toBeNull();
    });
  });

  describe('signals initial state', () => {
    it('should have initial signal values', () => {
      expect(service.items()).toEqual([]);
      expect(service.isLoading()).toBe(false);
      expect(service.errorMessage()).toBeNull();
    });
  });

  describe('computed signals', () => {
    it('should return computed items', () => {
      service['inventoryItems'].set(mockInventoryItems);
      expect(service.items()).toEqual(mockInventoryItems);
    });

    it('should return computed loading state', () => {
      service['loading'].set(true);
      expect(service.isLoading()).toBe(true);
    });

    it('should return computed error message', () => {
      service['error'].set('Test error');
      expect(service.errorMessage()).toBe('Test error');
    });
  });
});