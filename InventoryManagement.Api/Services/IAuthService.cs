using InventoryManagement.Api.Models;

namespace InventoryManagement.Api.Services;

public interface IAuthService
{
    Task<User?> RegisterAsync(RegisterUserDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginUserDto dto);
    Task<User?> GetUserByIdAsync(int id);
    bool ValidateToken(string token, out int userId);
}
