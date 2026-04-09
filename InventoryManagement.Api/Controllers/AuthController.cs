using Microsoft.AspNetCore.Mvc;
using InventoryManagement.Api.Models;
using InventoryManagement.Api.Services;

namespace InventoryManagement.Api.Controllers;

/// <summary>
/// Controller for authentication and user management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration failed for user {Username}", dto.Username);
            return StatusCode(500, new { message = "An error occurred during registration", details = ex.Message });
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
