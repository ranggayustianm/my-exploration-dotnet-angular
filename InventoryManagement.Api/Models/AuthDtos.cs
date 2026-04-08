using System.ComponentModel.DataAnnotations;

namespace InventoryManagement.Api.Models;

public record RegisterUserDto(
    [Required][MaxLength(50)] string Username,
    [Required][EmailAddress] string Email,
    [Required][MinLength(6)] string Password
);

public record LoginUserDto(
    [Required] string UsernameOrEmail,
    [Required] string Password
);

public record AuthResponseDto(
    string Token,
    string Username,
    string Email,
    DateTime ExpiresAt
);
