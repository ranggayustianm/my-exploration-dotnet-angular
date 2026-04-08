using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using InventoryManagement.Api.Models;
using InventoryManagement.Api.Services;

namespace InventoryManagement.Api.Controllers;

/// <summary>
/// Controller for managing inventory items
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _service;

    public InventoryController(IInventoryService service)
    {
        _service = service;
    }

    /// <summary>
    /// Get all inventory items
    /// </summary>
    /// <returns>List of all inventory items ordered by creation date</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryItem>>> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }

    /// <summary>
    /// Get a specific inventory item by ID
    /// </summary>
    /// <param name="id">The item ID</param>
    /// <returns>The inventory item if found</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryItem>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return NotFound();

        return Ok(item);
    }

    /// <summary>
    /// Create a new inventory item
    /// </summary>
    /// <param name="dto">The inventory item data</param>
    /// <returns>The created inventory item</returns>
    [HttpPost]
    public async Task<ActionResult<InventoryItem>> Create(CreateInventoryItemDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(new { message = "Validation failed.", errors });
        }

        var item = new InventoryItem
        {
            Name = dto.Name,
            Description = dto.Description,
            Quantity = dto.Quantity,
            Category = dto.Category,
            Price = dto.Price
        };

        var created = await _service.CreateAsync(item);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update an existing inventory item
    /// </summary>
    /// <param name="id">The item ID</param>
    /// <param name="dto">The updated inventory item data</param>
    /// <returns>The updated inventory item</returns>
    [HttpPut("{id}")]
    public async Task<ActionResult<InventoryItem>> Update(int id, UpdateInventoryItemDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(new { message = "Validation failed.", errors });
        }

        var item = new InventoryItem
        {
            Name = dto.Name,
            Description = dto.Description,
            Quantity = dto.Quantity,
            Category = dto.Category,
            Price = dto.Price
        };

        var updated = await _service.UpdateAsync(id, item);
        if (updated == null)
            return NotFound();

        return Ok(updated);
    }

    /// <summary>
    /// Delete an inventory item
    /// </summary>
    /// <param name="id">The item ID</param>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}

/// <summary>
/// Data for creating a new inventory item
/// </summary>
public class CreateInventoryItemDto
{
    /// <summary>
    /// Item name (1-100 characters)
    /// </summary>
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Item description (up to 500 characters)
    /// </summary>
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string? Description { get; set; }

    /// <summary>
    /// Item quantity (non-negative)
    /// </summary>
    [Range(0, int.MaxValue, ErrorMessage = "Quantity must be a non-negative number")]
    public int Quantity { get; set; }

    /// <summary>
    /// Item category (up to 50 characters)
    /// </summary>
    [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
    public string? Category { get; set; }

    /// <summary>
    /// Item price (non-negative)
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "Price must be a non-negative number")]
    public decimal Price { get; set; }
}

/// <summary>
/// Data for updating an existing inventory item
/// </summary>
public class UpdateInventoryItemDto
{
    /// <summary>
    /// Item name (1-100 characters)
    /// </summary>
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Item description (up to 500 characters)
    /// </summary>
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string? Description { get; set; }

    /// <summary>
    /// Item quantity (non-negative)
    /// </summary>
    [Range(0, int.MaxValue, ErrorMessage = "Quantity must be a non-negative number")]
    public int Quantity { get; set; }

    /// <summary>
    /// Item category (up to 50 characters)
    /// </summary>
    [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
    public string? Category { get; set; }

    /// <summary>
    /// Item price (non-negative)
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "Price must be a non-negative number")]
    public decimal Price { get; set; }
}