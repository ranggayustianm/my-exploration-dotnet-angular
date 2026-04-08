using Microsoft.AspNetCore.Mvc;
using InventoryManagement.Api.Models;
using InventoryManagement.Api.Services;

namespace InventoryManagement.Api.Controllers;

/// <summary>
/// Controller for authentication and user management
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Register a new user account
    /// </summary>
    /// <param name="dto">User registration data</param>
    /// <returns>Authentication response with JWT token</returns>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterUserDto dto)
    {
        try
        {
            var user = await _authService.RegisterAsync(dto);
            if (user == null)
                return BadRequest(new { message = "Registration failed" });

            var loginDto = new LoginUserDto(user.Username, dto.Password);
            var response = await _authService.LoginAsync(loginDto);

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch
        {
            return StatusCode(500, new { message = "An error occurred during registration" });
        }
    }

    /// <summary>
    /// Authenticate user and return JWT token
    /// </summary>
    /// <param name="dto">User login credentials</param>
    /// <returns>Authentication response with JWT token</returns>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginUserDto dto)
    {
        var response = await _authService.LoginAsync(dto);

        if (response == null)
            return Unauthorized(new { message = "Invalid username/email or password" });

        return Ok(response);
    }
}
