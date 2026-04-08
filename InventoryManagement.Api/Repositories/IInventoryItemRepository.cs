using InventoryManagement.Api.Models;
using InventoryManagement.Api.Repositories;

namespace InventoryManagement.Api.Repositories;

public interface IInventoryItemRepository : IRepository<InventoryItem>
{
    Task<IEnumerable<InventoryItem>> GetAllOrderedByDateAsync();
}
