using Moq;
using InventoryManagement.Api.Models;
using InventoryManagement.Api.Repositories;
using InventoryManagement.Api.Services;

namespace InventoryManagement.Api.Tests;

public class InventoryServiceTests
{
    private readonly Mock<IInventoryItemRepository> _mockRepository;
    private readonly InventoryService _service;

    public InventoryServiceTests()
    {
        _mockRepository = new Mock<IInventoryItemRepository>();
        _service = new InventoryService(_mockRepository.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllItems()
    {
        // Arrange
        var items = new List<InventoryItem>
        {
            new() { Id = 1, Name = "Item 1", Quantity = 10, Price = 9.99m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = 2, Name = "Item 2", Quantity = 20, Price = 19.99m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };

        _mockRepository
            .Setup(r => r.GetAllOrderedByDateAsync())
            .ReturnsAsync(items);

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        Assert.Equal(2, result.Count());
        _mockRepository.Verify(r => r.GetAllOrderedByDateAsync(), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsEmptyList_WhenNoItems()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.GetAllOrderedByDateAsync())
            .ReturnsAsync(new List<InventoryItem>());

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsItem_WhenExists()
    {
        // Arrange
        var item = new InventoryItem
        {
            Id = 1,
            Name = "Test Item",
            Description = "Test Description",
            Quantity = 5,
            Category = "Test Category",
            Price = 29.99m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(item);

        // Act
        var result = await _service.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test Item", result.Name);
        Assert.Equal("Test Description", result.Description);
        Assert.Equal(5, result.Quantity);
        Assert.Equal("Test Category", result.Category);
        Assert.Equal(29.99m, result.Price);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((InventoryItem?)null);

        // Act
        var result = await _service.GetByIdAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_AddsItem_WithTimestamps()
    {
        // Arrange
        var newItem = new InventoryItem
        {
            Name = "New Item",
            Description = "New Description",
            Quantity = 15,
            Category = "New Category",
            Price = 49.99m
        };

        var createdItem = new InventoryItem
        {
            Id = 1,
            Name = newItem.Name,
            Description = newItem.Description,
            Quantity = newItem.Quantity,
            Category = newItem.Category,
            Price = newItem.Price,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockRepository
            .Setup(r => r.AddAsync(It.IsAny<InventoryItem>()))
            .ReturnsAsync(createdItem);

        // Act
        var result = await _service.CreateAsync(newItem);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal("New Item", result.Name);
        Assert.Equal("New Description", result.Description);
        Assert.Equal(15, result.Quantity);
        Assert.Equal("New Category", result.Category);
        Assert.Equal(49.99m, result.Price);
        Assert.True(result.CreatedAt.Kind == DateTimeKind.Utc);
        Assert.True(result.UpdatedAt.Kind == DateTimeKind.Utc);

        // Verify timestamps were set by the service
        _mockRepository.Verify(r => r.AddAsync(It.Is<InventoryItem>(i => i.CreatedAt != default && i.UpdatedAt != default)), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesItem_WhenExists()
    {
        // Arrange
        var existingItem = new InventoryItem
        {
            Id = 1,
            Name = "Original",
            Description = "Original Description",
            Quantity = 5,
            Category = "Original Category",
            Price = 10.00m,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };

        var updateItem = new InventoryItem
        {
            Name = "Updated",
            Description = "Updated Description",
            Quantity = 25,
            Category = "Updated Category",
            Price = 20.00m
        };

        _mockRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(existingItem);

        _mockRepository
            .Setup(r => r.UpdateAsync(It.IsAny<InventoryItem>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.UpdateAsync(1, updateItem);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated", result.Name);
        Assert.Equal("Updated Description", result.Description);
        Assert.Equal(25, result.Quantity);
        Assert.Equal("Updated Category", result.Category);
        Assert.Equal(20.00m, result.Price);
        Assert.True(result.UpdatedAt.Kind == DateTimeKind.Utc);

        _mockRepository.Verify(r => r.UpdateAsync(existingItem), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNull_WhenNotExists()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((InventoryItem?)null);

        var updateItem = new InventoryItem
        {
            Name = "Test",
            Quantity = 10,
            Price = 5.00m
        };

        // Act
        var result = await _service.UpdateAsync(999, updateItem);

        // Assert
        Assert.Null(result);
        _mockRepository.Verify(r => r.UpdateAsync(It.IsAny<InventoryItem>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsTrue_WhenExists()
    {
        // Arrange
        var item = new InventoryItem
        {
            Id = 1,
            Name = "To Delete",
            Quantity = 0,
            Price = 0m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(item);

        _mockRepository
            .Setup(r => r.DeleteAsync(item))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.DeleteAsync(1);

        // Assert
        Assert.True(result);
        _mockRepository.Verify(r => r.DeleteAsync(item), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenNotExists()
    {
        // Arrange
        _mockRepository
            .Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((InventoryItem?)null);

        // Act
        var result = await _service.DeleteAsync(999);

        // Assert
        Assert.False(result);
        _mockRepository.Verify(r => r.DeleteAsync(It.IsAny<InventoryItem>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_SetsTimestampsBeforeSaving()
    {
        // Arrange
        var newItem = new InventoryItem
        {
            Name = "Timestamp Test",
            Quantity = 1,
            Price = 1.00m
        };

        InventoryItem? capturedItem = null;
        _mockRepository
            .Setup(r => r.AddAsync(It.IsAny<InventoryItem>()))
            .Callback<InventoryItem>(item => capturedItem = item)
            .ReturnsAsync((InventoryItem item) => item);

        // Act
        await _service.CreateAsync(newItem);

        // Assert
        Assert.NotNull(capturedItem);
        Assert.True(capturedItem.CreatedAt.Kind == DateTimeKind.Utc);
        Assert.True(capturedItem.UpdatedAt.Kind == DateTimeKind.Utc);
    }

    [Fact]
    public async Task UpdateAsync_SetsUpdatedAtToUtcNow()
    {
        // Arrange
        var beforeUpdate = DateTime.UtcNow;

        var existingItem = new InventoryItem
        {
            Id = 1,
            Name = "Original",
            Quantity = 5,
            Price = 10.00m,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };

        var updateItem = new InventoryItem
        {
            Name = "Updated",
            Quantity = 10,
            Price = 15.00m
        };

        _mockRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(existingItem);

        _mockRepository
            .Setup(r => r.UpdateAsync(It.IsAny<InventoryItem>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _service.UpdateAsync(1, updateItem);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.UpdatedAt >= beforeUpdate);
        Assert.True(result.UpdatedAt.Kind == DateTimeKind.Utc);
    }
}
