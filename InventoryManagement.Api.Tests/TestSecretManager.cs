using Microsoft.Extensions.Configuration;

namespace InventoryManagement.Api.Tests;

public static class TestSecretManager
{
    private static string? _jwtKey;
    
    public static string GetJwtKey()
    {
        if (_jwtKey == null)
        {
            var config = new ConfigurationBuilder()
                .AddUserSecrets<InventoryApiIntegrationTests>()
                .Build();
            
            _jwtKey = config["Jwt:Key"] ?? "YourSuperSecretKeyThatIsAtLeast64CharactersLong!";
        }
        return _jwtKey;
    }
}