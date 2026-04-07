using Xunit;
using Microsoft.EntityFrameworkCore;
using InventoryManagement.Api.Data;
using InventoryManagement.Api.Models;
using InventoryManagement.Api.Services;

namespace InventoryManagement.Api.Tests;

public class InventoryServiceTests
{
    private InventoryDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<InventoryDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new InventoryDbContext(options);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllItems()
    {
        // Arrange
        using var context = CreateInMemoryContext();
        context.InventoryItems.AddRange(
            new InventoryItem { Id = 1, Name = "Item 1", Quantity = 10, Price = 9.99m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new InventoryItem { Id = 2, Name = "Item 2", Quantity = 20, Price = 19.99m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();

        var service = new InventoryService(context);

        // Act
        var items = await service.GetAllAsync();

        // Assert
        Assert.Equal(2, items.Count());
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsItem_WhenExists()
    {
        // Arrange
        using var context = CreateInMemoryContext();
        context.InventoryItems.Add(new InventoryItem
        {
            Id = 1,
            Name = "Test Item",
            Quantity = 5,
            Price = 29.99m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var service = new InventoryService(context);

        // Act
        var item = await service.GetByIdAsync(1);

        // Assert
        Assert.NotNull(item);
        Assert.Equal("Test Item", item.Name);
        Assert.Equal(5, item.Quantity);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        // Arrange
        using var context = CreateInMemoryContext();
        var service = new InventoryService(context);

        // Act
        var item = await service.GetByIdAsync(999);

        // Assert
        Assert.Null(item);
    }

    [Fact]
    public async Task CreateAsync_AddsItem()
    {
        // Arrange
        using var context = CreateInMemoryContext();
        var service = new InventoryService(context);

        var newItem = new InventoryItem
        {
            Name = "New Item",
            Quantity = 15,
            Price = 49.99m
        };

        // Act
        var created = await service.CreateAsync(newItem);

        // Assert
        Assert.NotNull(created);
        Assert.True(created.Id > 0);
        Assert.Equal("New Item", created.Name);
        Assert.Equal(15, created.Quantity);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesItem_WhenExists()
    {
        // Arrange
        using var context = CreateInMemoryContext();
        context.InventoryItems.Add(new InventoryItem
        {
            Id = 1,
            Name = "Original",
            Quantity = 5,
            Price = 10.00m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var service = new InventoryService(context);
        var updateItem = new InventoryItem
        {
            Name = "Updated",
            Quantity = 25,
            Price = 20.00m
        };

        // Act
        var updated = await service.UpdateAsync(1, updateItem);

        // Assert
        Assert.NotNull(updated);
        Assert.Equal("Updated", updated.Name);
        Assert.Equal(25, updated.Quantity);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNull_WhenNotExists()
    {
        // Arrange
        using var context = CreateInMemoryContext();
        var service = new InventoryService(context);

        var updateItem = new InventoryItem
        {
            Name = "Test",
            Quantity = 10,
            Price = 5.00m
        };

        // Act
        var updated = await service.UpdateAsync(999, updateItem);

        // Assert
        Assert.Null(updated);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsTrue_WhenExists()
    {
        // Arrange
        using var context = CreateInMemoryContext();
        context.InventoryItems.Add(new InventoryItem
        {
            Id = 1,
            Name = "To Delete",
            Quantity = 0,
            Price = 0m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var service = new InventoryService(context);

        // Act
        var result = await service.DeleteAsync(1);

        // Assert
        Assert.True(result);
        Assert.Null(await service.GetByIdAsync(1));
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenNotExists()
    {
        // Arrange
        using var context = CreateInMemoryContext();
        var service = new InventoryService(context);

        // Act
        var result = await service.DeleteAsync(999);

        // Assert
        Assert.False(result);
    }
}