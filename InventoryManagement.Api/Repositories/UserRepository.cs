using Microsoft.EntityFrameworkCore;
using InventoryManagement.Api.Data;
using InventoryManagement.Api.Models;

namespace InventoryManagement.Api.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<User?> FindByUsernameOrEmailAsync(string usernameOrEmail)
    {
        return await _dbSet
            .FirstOrDefaultAsync(u => u.Username == usernameOrEmail || u.Email == usernameOrEmail);
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
        return await _dbSet.AnyAsync(u => u.Username == username);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _dbSet.AnyAsync(u => u.Email == email);
    }
}
