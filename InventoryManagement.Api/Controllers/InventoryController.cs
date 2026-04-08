using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InventoryManagement.Api.Models;
using InventoryManagement.Api.Services;

namespace InventoryManagement.Api.Controllers;

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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryItem>>> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryItem>> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return NotFound();

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<InventoryItem>> Create(CreateInventoryItemDto dto)
    {
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

    [HttpPut("{id}")]
    public async Task<ActionResult<InventoryItem>> Update(int id, UpdateInventoryItemDto dto)
    {
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}

public record CreateInventoryItemDto(
    string Name,
    string? Description,
    int Quantity,
    string? Category,
    decimal Price
);

public record UpdateInventoryItemDto(
    string Name,
    string? Description,
    int Quantity,
    string? Category,
    decimal Price
);