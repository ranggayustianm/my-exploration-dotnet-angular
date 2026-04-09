# Managing Secrets in InventoryManagement.Api

This project supports two methods for managing sensitive configuration data like JWT keys and database passwords:

## Option 1: Using .NET User Secrets (Recommended for Development)

.NET User Secrets stores sensitive data outside your project tree in a location managed by .NET.

### Setup User Secrets:

1. **Initialize User Secrets** (already configured in `.csproj`):
   ```bash
   cd InventoryManagement.Api
   dotnet user-secrets init
   ```

2. **Set your secrets**:
   ```bash
   # Set JWT Key
   dotnet user-secrets set "Jwt:Key" "your-super-secret-jwt-key-at-least-64-characters"
   
   # Set Database Connection String
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=inventorydb;Username=postgres;Password=your-secure-password"
   ```

3. **List current secrets**:
   ```bash
   dotnet user-secrets list
   ```

4. **Remove secrets** (if needed):
   ```bash
   # Remove a specific secret
   dotnet user-secrets remove "Jwt:Key"
   
   # Remove all secrets
   dotnet user-secrets clear
   ```

User Secrets are automatically loaded in Development environment and will override values in `appsettings.json`.

## Option 2: Using secrets.json File

A `secrets.json` template file is provided for reference. **DO NOT commit this file with real secrets!**

1. Copy `secrets.json` and update with your actual values
2. The file is already in `.gitignore` to prevent accidental commits

## Production Deployment

For production, use environment variables or Azure Key Vault:

### Environment Variables:
```bash
# Linux/Mac
export ConnectionStrings__DefaultConnection="Host=..."
export Jwt__Key="your-jwt-key"

# Windows (PowerShell)
$env:ConnectionStrings__DefaultConnection="Host=..."
$env:Jwt__Key="your-jwt-key"
```

### Docker:
```bash
docker run -e "ConnectionStrings__DefaultConnection=Host=..." -e "Jwt__Key=your-key" your-image
```

## Security Best Practices

- ✅ Use User Secrets for development
- ✅ Use environment variables or key vaults for production
- ✅ Never commit real secrets to version control
- ✅ Rotate secrets regularly
- ✅ Use strong, randomly generated keys (JWT key should be at least 64 characters)

## Current Configuration

The `appsettings.json` contains placeholder values for development. User Secrets will override these when set.
