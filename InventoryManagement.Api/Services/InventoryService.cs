using InventoryManagement.Api.Models;
using InventoryManagement.Api.Repositories;

namespace InventoryManagement.Api.Services;

public interface IInventoryService
{
    Task<IEnumerable<InventoryItem>> GetAllAsync();
    Task<InventoryItem?> GetByIdAsync(int id);
    Task<InventoryItem> CreateAsync(InventoryItem item);
    Task<InventoryItem?> UpdateAsync(int id, InventoryItem item);
    Task<bool> DeleteAsync(int id);
}

public class InventoryService : IInventoryService
{
    private readonly IInventoryItemRepository _repository;

    public InventoryService(IInventoryItemRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<InventoryItem>> GetAllAsync()
    {
        return await _repository.GetAllOrderedByDateAsync();
    }

    public async Task<InventoryItem?> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<InventoryItem> CreateAsync(InventoryItem item)
    {
        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;

        return await _repository.AddAsync(item);
    }

    public async Task<InventoryItem?> UpdateAsync(int id, InventoryItem item)
    {
        var existingItem = await _repository.GetByIdAsync(id);
        if (existingItem == null)
            return null;

        existingItem.Name = item.Name;
        existingItem.Description = item.Description;
        existingItem.Quantity = item.Quantity;
        existingItem.Category = item.Category;
        existingItem.Price = item.Price;
        existingItem.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(existingItem);

        return existingItem;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);
        if (item == null)
            return false;

        await _repository.DeleteAsync(item);
        return true;
    }
}