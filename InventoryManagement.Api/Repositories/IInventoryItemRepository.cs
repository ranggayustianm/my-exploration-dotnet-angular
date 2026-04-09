using InventoryManagement.Api.Models;

namespace InventoryManagement.Api.Repositories;

public interface IInventoryItemRepository : IRepository<InventoryItem>
{
    Task<IEnumerable<InventoryItem>> GetAllOrderedByDateAsync();
}
