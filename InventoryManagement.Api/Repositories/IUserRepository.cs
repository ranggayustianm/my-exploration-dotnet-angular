using InventoryManagement.Api.Models;

namespace InventoryManagement.Api.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> FindByUsernameOrEmailAsync(string usernameOrEmail);
    Task<bool> UsernameExistsAsync(string username);
    Task<bool> EmailExistsAsync(string email);
}
