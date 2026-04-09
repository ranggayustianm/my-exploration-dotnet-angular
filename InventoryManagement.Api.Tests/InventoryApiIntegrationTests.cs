using System.Net.Http.Json;
using System.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using InventoryManagement.Api.Data;
using InventoryManagement.Api.Models;

namespace InventoryManagement.Api.Tests;

/// <summary>
/// Custom WebApplicationFactory that configures an in-memory database for integration testing
/// Uses the actual Program.cs (minimal API) instead of a separate Startup class
/// </summary>
public class IntegrationTestFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
    }
}

/// <summary>
/// Helper class to generate JWT tokens for testing authenticated endpoints
/// </summary>
public static class AuthHelper
{
    public static string GenerateTestToken()
    {
        var claims = new[]
        {
	        new Claim("UserId", "909"),
            new Claim(ClaimTypes.Name, "test_admin"),
            new Claim(ClaimTypes.Email, "test_admin@example.com")
        };

        Console.WriteLine(TestSecretManager.GetJwtKey());

        var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("LtpWXzd9hWbgpegg7KHEc5RwcyUBrExQ3yzH1dYvZ6LR6WdNA281Ab8yfVTK60k4Tku5TxW4I0OqexEyEhvd6u"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static void SetAuthToken(this HttpClient client, string token)
    {
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }
}

/// <summary>
/// Integration tests for the Inventory API endpoints
/// These tests verify the full stack: HTTP request → Controller → Service → Repository → Database
/// </summary>
public class InventoryApiIntegrationTests : IClassFixture<IntegrationTestFactory>
{
    private readonly HttpClient _client;
    private readonly IntegrationTestFactory _factory;

    public InventoryApiIntegrationTests(IntegrationTestFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _client.SetAuthToken(AuthHelper.GenerateTestToken());
    }

    [Fact]
    public async Task Get_EndpointReturnsOkWithInventoryList()
    {
        // Arrange - Seed the database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
        
        db.InventoryItems.AddRange(
            new InventoryItem { Name = "Item 1", Quantity = 10, Price = 9.99m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new InventoryItem { Name = "Item 2", Quantity = 20, Price = 19.99m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
        await db.SaveChangesAsync();

        // Act
        var response = await _client.GetAsync("/api/inventory");

        // Assert
        response.EnsureSuccessStatusCode();
        var items = await response.Content.ReadFromJsonAsync<List<InventoryItem>>();
        
        Assert.NotNull(items);
        Assert.True(items.Count > 0);
        Assert.Contains(items, i => i.Name == "Item 1");
        Assert.Contains(items, i => i.Name == "Item 2");
    }

    [Fact]
    public async Task Post_EndpointCreatesNewItem()
    {
        // Arrange
        var newItem = new
        {
            Name = "Test Item",
            Description = "Test Description",
            Quantity = 5,
            Category = "Test Category",
            Price = 29.99m
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/inventory", newItem);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var createdItem = await response.Content.ReadFromJsonAsync<InventoryItem>();
        Assert.NotNull(createdItem);
        Assert.Equal("Test Item", createdItem.Name);
        Assert.Equal("Test Description", createdItem.Description);
        Assert.Equal(5, createdItem.Quantity);
        Assert.True(createdItem.Id > 0);
        Assert.True(createdItem.CreatedAt != default);
        Assert.True(createdItem.UpdatedAt != default);

        // Verify it's actually in the database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
        var dbItem = await db.InventoryItems.FindAsync(createdItem.Id);
        Assert.NotNull(dbItem);
        Assert.Equal("Test Item", dbItem.Name);
    }

    [Fact]
    public async Task Get_ByIdReturnsSpecificItem()
    {
        // Arrange - Seed the database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
        
        var item = new InventoryItem 
        { 
            Name = "Specific Item", 
            Quantity = 15, 
            Price = 49.99m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        db.InventoryItems.Add(item);
        await db.SaveChangesAsync();
        var itemId = item.Id;

        // Act
        var response = await _client.GetAsync($"/api/inventory/{itemId}");

        // Assert
        response.EnsureSuccessStatusCode();
        var retrievedItem = await response.Content.ReadFromJsonAsync<InventoryItem>();
        
        Assert.NotNull(retrievedItem);
        Assert.Equal("Specific Item", retrievedItem.Name);
        Assert.Equal(15, retrievedItem.Quantity);
    }

    [Fact]
    public async Task Get_ByIdReturnsNotFound_WhenItemDoesNotExist()
    {
        // Act
        var response = await _client.GetAsync("/api/inventory/9999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Put_EndpointUpdatesExistingItem()
    {
        // Arrange - Seed the database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
        
        var item = new InventoryItem 
        { 
            Name = "Original Name", 
            Quantity = 5, 
            Price = 10.00m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        db.InventoryItems.Add(item);
        await db.SaveChangesAsync();
        var itemId = item.Id;

        var updateDto = new
        {
            Name = "Updated Name",
            Description = "Updated Description",
            Quantity = 25,
            Category = "Updated Category",
            Price = 20.00m
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/inventory/{itemId}", updateDto);

        // Assert
        response.EnsureSuccessStatusCode();
        
        var updatedItem = await response.Content.ReadFromJsonAsync<InventoryItem>();
        Assert.NotNull(updatedItem);
        Assert.Equal("Updated Name", updatedItem.Name);
        Assert.Equal(25, updatedItem.Quantity);
        Assert.Equal(20.00m, updatedItem.Price);

        // Verify in database
        using var verifyScope = _factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<InventoryDbContext>();
        var dbItem = await verifyDb.InventoryItems.FindAsync(itemId);
        Assert.NotNull(dbItem);
        Assert.Equal("Updated Name", dbItem.Name);
        Assert.Equal(25, dbItem.Quantity);
    }

    [Fact]
    public async Task Put_EndpointReturnsNotFound_WhenItemDoesNotExist()
    {
        // Arrange
        var updateDto = new
        {
            Name = "Non-existent Item",
            Quantity = 10,
            Price = 5.00m
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/inventory/9999", updateDto);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Delete_EndpointDeletesExistingItem()
    {
        // Arrange - Seed the database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
        
        var item = new InventoryItem 
        { 
            Name = "To Delete", 
            Quantity = 1, 
            Price = 1.00m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        db.InventoryItems.Add(item);
        await db.SaveChangesAsync();
        var itemId = item.Id;

        // Act
        var response = await _client.DeleteAsync($"/api/inventory/{itemId}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        
        // Verify it's deleted from database
        using var verifyScope = _factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<InventoryDbContext>();
        var dbItem = await verifyDb.InventoryItems.FindAsync(itemId);
        Assert.Null(dbItem);
    }

    [Fact]
    public async Task Delete_EndpointReturnsNotFound_WhenItemDoesNotExist()
    {
        // Act
        var response = await _client.DeleteAsync("/api/inventory/9999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Post_EndpointReturnsBadRequest_WhenModelIsInvalid()
    {
        // Arrange - Create invalid model (missing required Name field)
        var invalidItem = new { Quantity = -5 };

        // Act
        var response = await _client.PostAsJsonAsync("/api/inventory", invalidItem);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Get_EndpointReturnsUnauthorized_WhenNoTokenProvided()
    {
        // Arrange - Create client without authentication
        var unauthenticatedClient = _factory.CreateClient();

        // Act
        var response = await unauthenticatedClient.GetAsync("/api/inventory");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
