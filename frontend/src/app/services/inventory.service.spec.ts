import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InventoryService } from './inventory.service';
import { InventoryItem, CreateInventoryItemDto, UpdateInventoryItemDto } from '../models/inventory-item.model';

describe('InventoryService', () => {
  let service: InventoryService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:5000/api/inventory';

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
    it('should return inventory items', (done) => {
      service.getInventoryItems().subscribe(items => {
        expect(items).toEqual(mockInventoryItems);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockInventoryItems);
    });

    it('should handle error when fetching items fails', (done) => {
      service.getInventoryItems().subscribe({
        next: () => fail('Expected an error, not items'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Server error', { status: 500, statusText: 'Server Error' });
    });

    it('should update loading and error signals', (done) => {
      expect(service.isLoading()).toBe(false);
      expect(service.errorMessage()).toBeNull();

      service.getInventoryItems().subscribe(() => {
        expect(service.isLoading()).toBe(false);
        expect(service.errorMessage()).toBeNull();
        done();
      });

      expect(service.isLoading()).toBe(true);

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockInventoryItems);
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
  });

  describe('createInventoryItem', () => {
    it('should create a new inventory item', (done) => {
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
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newItem);
      req.flush(createdItem);
    });
  });

  describe('updateInventoryItem', () => {
    it('should update an existing inventory item', (done) => {
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
  });

  describe('deleteInventoryItem', () => {
    it('should delete an inventory item', (done) => {
      service.deleteInventoryItem(1).subscribe(response => {
        expect(response).toBeUndefined();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
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

  describe('signals', () => {
    it('should have initial signal values', () => {
      expect(service.items()).toEqual([]);
      expect(service.isLoading()).toBe(false);
      expect(service.errorMessage()).toBeNull();
    });

    it('should update items signal after successful fetch', (done) => {
      service.getInventoryItems().subscribe(() => {
        expect(service.items()).toEqual(mockInventoryItems);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockInventoryItems);
    });
  });
});