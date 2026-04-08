using Microsoft.EntityFrameworkCore;
using InventoryManagement.Api.Data;
using InventoryManagement.Api.Models;

namespace InventoryManagement.Api.Repositories;

public class InventoryItemRepository : Repository<InventoryItem>, IInventoryItemRepository
{
    public InventoryItemRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<InventoryItem>> GetAllOrderedByDateAsync()
    {
        return await _dbSet
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }
}
