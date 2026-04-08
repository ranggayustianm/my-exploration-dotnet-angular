using Microsoft.EntityFrameworkCore;
using InventoryManagement.Api.Models;

namespace InventoryManagement.Api.Data;

public class InventoryDbContext : DbContext
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options)
        : base(options)
    {
    }

    public DbSet<InventoryItem> InventoryItems { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Quantity).IsRequired();
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.Price).IsRequired().HasColumnType("decimal(18,2)");
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.PasswordSalt).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
            
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Seed initial data
        modelBuilder.Entity<InventoryItem>().HasData(
            new InventoryItem
            {
                Id = 1,
                Name = "Laptop",
                Description = "High-performance laptop for development work",
                Quantity = 5,
                Category = "Electronics",
                Price = 999.99m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id = 2,
                Name = "Office Chair",
                Description = "Ergonomic office chair with lumbar support",
                Quantity = 10,
                Category = "Furniture",
                Price = 249.99m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id = 3,
                Name = "Printer",
                Description = "Wireless color printer with scanner",
                Quantity = 7,
                Category = "Electronics",
                Price = 199.99m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id = 4,
                Name = "Notebooks",
                Description = "Pack of 5 spiral-bound notebooks",
                Quantity = 100,
                Category = "Office Supplies",
                Price = 4.99m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id = 5,
                Name = "Pens",
                Description = "Box of 50 ballpoint pens",
                Quantity = 200,
                Category = "Office Supplies",
                Price = 2.99m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );
    }
}