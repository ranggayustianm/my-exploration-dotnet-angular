using System.Security.Cryptography;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using InventoryManagement.Api.Models;
using InventoryManagement.Api.Repositories;

namespace InventoryManagement.Api.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _config;
    private readonly TimeSpan _tokenLifetime = TimeSpan.FromHours(24);

    public AuthService(IUserRepository userRepository, IConfiguration config)
    {
        _userRepository = userRepository;
        _config = config;
    }

    public async Task<User?> RegisterAsync(RegisterUserDto dto)
    {
        // Check if username or email already exists
        if (await _userRepository.UsernameExistsAsync(dto.Username) || await _userRepository.EmailExistsAsync(dto.Email))
            throw new InvalidOperationException("Username or email already exists");

        CreatePasswordHash(dto.Password, out byte[] passwordHash, out byte[] passwordSalt);

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return await _userRepository.AddAsync(user);
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginUserDto dto)
    {
        var user = await _userRepository.FindByUsernameOrEmailAsync(dto.UsernameOrEmail);

        if (user == null)
            return null;

        if (!VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt))
            return null;

        string token = CreateToken(user);

        return new AuthResponseDto(
            token,
            user.Username,
            user.Email,
            DateTime.UtcNow.Add(_tokenLifetime)
        );
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _userRepository.GetByIdAsync(id);
    }

    public bool ValidateToken(string token, out int userId)
    {
        userId = 0;
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"] ?? "YourSuperSecretKeyThatIsAtLeast64CharactersLong!");

            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            var userIdClaim = jwtToken.Claims.First(x => x.Type == "UserId").Value;
            userId = int.Parse(userIdClaim);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
        using var hmac = new HMACSHA512();
        passwordSalt = hmac.Key;
        passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
    }

    private bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
    {
        using var hmac = new HMACSHA512(storedSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return computedHash.SequenceEqual(storedHash);
    }

    private string CreateToken(User user)
    {
        var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"] ?? "YourSuperSecretKeyThatIsAtLeast64CharactersLong!");

        var claims = new List<Claim>
        {
            new Claim("UserId", user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha512Signature
        );

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.Add(_tokenLifetime),
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
