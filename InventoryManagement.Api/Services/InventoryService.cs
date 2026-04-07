using Microsoft.EntityFrameworkCore;
using InventoryManagement.Api.Data;
using InventoryManagement.Api.Models;

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
    private readonly InventoryDbContext _context;

    public InventoryService(InventoryDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<InventoryItem>> GetAllAsync()
    {
        return await _context.InventoryItems
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<InventoryItem?> GetByIdAsync(int id)
    {
        return await _context.InventoryItems.FindAsync(id);
    }

    public async Task<InventoryItem> CreateAsync(InventoryItem item)
    {
        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;

        _context.InventoryItems.Add(item);
        await _context.SaveChangesAsync();

        return item;
    }

    public async Task<InventoryItem?> UpdateAsync(int id, InventoryItem item)
    {
        var existingItem = await _context.InventoryItems.FindAsync(id);
        if (existingItem == null)
            return null;

        existingItem.Name = item.Name;
        existingItem.Description = item.Description;
        existingItem.Quantity = item.Quantity;
        existingItem.Category = item.Category;
        existingItem.Price = item.Price;
        existingItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return existingItem;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item == null)
            return false;

        _context.InventoryItems.Remove(item);
        await _context.SaveChangesAsync();

        return true;
    }
}