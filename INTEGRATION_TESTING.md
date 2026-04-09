# Integration Testing Guide for .NET API

## Overview

This project now includes **integration tests** that test the full API stack end-to-end, unlike the existing **unit tests** that mock dependencies.

### Unit Tests vs Integration Tests

| Aspect | Unit Tests | Integration Tests |
|--------|-----------|-------------------|
| **Scope** | Test single class/method in isolation | Test multiple components working together |
| **Dependencies** | Mocked (using Moq) | Real implementations |
| **Database** | Mocked repository | In-memory database |
| **HTTP Layer** | Not tested | Full HTTP request/response cycle |
| **Speed** | Fast | Slower |
| **Use Case** | Business logic validation | End-to-end functionality validation |

## What's Included

### 1. Integration Test Infrastructure

**File:** `InventoryManagement.Api.Tests/InventoryApiIntegrationTests.cs`

- **`IntegrationTestFactory`**: Custom `WebApplicationFactory<Program>` that:
  - Hosts your API in-memory
  - Replaces PostgreSQL with an in-memory database
  - Applies migrations automatically
  
- **`AuthHelper`**: Generates JWT tokens for testing authenticated endpoints

### 2. Test Coverage

The integration tests cover:

✅ **GET /api/inventory** - Retrieve all items  
✅ **GET /api/inventory/{id}** - Retrieve specific item  
✅ **POST /api/inventory** - Create new item  
✅ **PUT /api/inventory/{id}** - Update existing item  
✅ **DELETE /api/inventory/{id}** - Delete item  
✅ **Authentication** - Unauthorized access returns 401  
✅ **Validation** - Invalid models return 400  
✅ **Not Found** - Non-existent items return 404  

## How to Run Integration Tests

### Option 1: Run All Tests
```bash
cd InventoryManagement.Api.Tests
dotnet test
```

### Option 2: Run Only Integration Tests
```bash
cd InventoryManagement.Api.Tests
dotnet test --filter "FullyQualifiedName~InventoryApiIntegrationTests"
```

### Option 3: Run with Verbose Output
```bash
cd InventoryManagement.Api.Tests
dotnet test --logger "console;verbosity=detailed"
```

### Option 4: Run with Coverage
```bash
cd InventoryManagement.Api.Tests
dotnet test --collect:"XPlat Code Coverage"
```

## Key Differences from Unit Tests

### Unit Test Example (Existing)
```csharp
[Fact]
public async Task GetAllAsync_ReturnsAllItems()
{
    // Mock the repository
    _mockRepository.Setup(r => r.GetAllOrderedByDateAsync())
                   .ReturnsAsync(items);
    
    // Test only the service layer
    var result = await _service.GetAllAsync();
    
    Assert.Equal(2, result.Count());
}
```

### Integration Test Example (New)
```csharp
[Fact]
public async Task Get_EndpointReturnsOkWithInventoryList()
{
    // Seed the actual in-memory database
    db.InventoryItems.AddRange(item1, item2);
    await db.SaveChangesAsync();
    
    // Make real HTTP request
    var response = await _client.GetAsync("/api/inventory");
    
    // Verify full stack: HTTP → Controller → Service → Repository → DB
    response.EnsureSuccessStatusCode();
    var items = await response.Content.ReadFromJsonAsync<List<InventoryItem>>();
    Assert.Equal(2, items.Count);
}
```

## How It Works

### 1. WebApplicationFactory
```csharp
public class IntegrationTestFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Replace PostgreSQL with in-memory database
            services.AddDbContext<InventoryDbContext>(options =>
            {
                options.UseInMemoryDatabase("IntegrationTestDb");
            });
        });
    }
}
```

### 2. Test Class Setup
```csharp
public class InventoryApiIntegrationTests : IClassFixture<IntegrationTestFactory>
{
    private readonly HttpClient _client;
    
    public InventoryApiIntegrationTests(IntegrationTestFactory factory)
    {
        _client = factory.CreateClient();
        _client.SetAuthToken(AuthHelper.GenerateTestToken());
    }
}
```

### 3. Database Seeding
```csharp
[Fact]
public async Task MyTest()
{
    // Arrange - Seed database
    using var scope = _factory.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
    
    db.InventoryItems.Add(new InventoryItem { Name = "Test", Quantity = 5, Price = 9.99m });
    await db.SaveChangesAsync();
    
    // Act - Make HTTP request
    var response = await _client.GetAsync("/api/inventory");
    
    // Assert - Verify response
    response.EnsureSuccessStatusCode();
}
```

## Best Practices

### ✅ DO
- Test happy paths and error cases
- Verify data is actually persisted in database
- Test authentication/authorization
- Test model validation
- Use descriptive test names (What is being tested _ Under what conditions _ Expected outcome)

### ❌ DON'T
- Don't test external services (use mocks for those)
- Don't share database state between tests (each test gets fresh DB)
- Don't test framework code (ASP.NET Core, Entity Framework)
- Don't replace all unit tests (keep both types)

## Adding New Integration Tests

### Template
```csharp
[Fact]
public async Task YourEndpoint_ExpectedBehavior_WhenCondition()
{
    // Arrange - Seed database if needed
    using var scope = _factory.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
    
    // Add test data
    db.YourEntities.Add(testData);
    await db.SaveChangesAsync();
    
    // Act - Make HTTP request
    var response = await _client.PostAsJsonAsync("/api/endpoint", requestData);
    
    // Assert - Verify response
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    
    // Optional: Verify database state
    var dbItem = await db.YourEntities.FindAsync(id);
    Assert.NotNull(dbItem);
}
```

## Troubleshooting

### Tests Fail with Database Errors
- Each test uses `IClassFixture` which provides a fresh database
- If tests interfere with each other, ensure you're using separate scopes

### Authentication Errors
- Make sure to set the JWT token on the HTTP client
- The test token uses the same key as configured in `Program.cs`

### Tests Are Slow
- Integration tests are inherently slower than unit tests
- Consider running them separately in CI/CD pipeline
- Use `[Collection]` attribute to control parallel execution

## CI/CD Integration

Add to your GitHub Actions or CI/CD pipeline:

```yaml
- name: Run Unit Tests
  run: dotnet test --filter "FullyQualifiedName!~InventoryApiIntegrationTests"
  
- name: Run Integration Tests
  run: dotnet test --filter "FullyQualifiedName~InventoryApiIntegrationTests"
```

## Next Steps

1. **Add more test scenarios:**
   - Edge cases (large payloads, special characters)
   - Pagination tests
   - Sorting/filtering tests
   
2. **Add API integration tests for:**
   - Authentication endpoints
   - File upload endpoints
   - WebSocket connections
   
3. **Consider adding:**
   - Load testing with k6 or Apache JMeter
   - Contract testing with Pact
   - End-to-end UI tests with Playwright or Cypress

## Resources

- [Microsoft Docs: Integration Tests](https://docs.microsoft.com/en-us/aspnet/core/test/integration-tests)
- [xUnit Documentation](https://xunit.net/docs/getting-started)
- [WebApplicationFactory](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.testing.webapplicationfactory-1)
