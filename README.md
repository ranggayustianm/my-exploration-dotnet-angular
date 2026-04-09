# Inventory Management System

A full-stack Inventory Management application built with **.NET 9.0** (ASP.NET Core Web API) and **Angular 19**.

## Tech Stack

### Backend
- **.NET 9.0** (ASP.NET Core Web API)
- **Entity Framework Core** with **Npgsql** (PostgreSQL)
- **JWT Authentication**
- **Swagger/OpenAPI** documentation
- **Repository & Service pattern** architecture

### Frontend
- **Angular 19**
- **Tailwind CSS** for styling
- **RxJS** for reactive programming
- **Karma + Jasmine** for unit testing

## Project Structure

```
my-exploration-dotnet-angular/
├── InventoryManagement.Api/          # Backend API
│   ├── Controllers/                  # API endpoints
│   │   ├── AuthController.cs         # Authentication endpoints
│   │   └── InventoryController.cs    # Inventory management endpoints
│   ├── Data/                         # DbContext and database configuration
│   ├── Migrations/                   # EF Core database migrations
│   ├── Middleware/                   # Custom middleware (e.g., error handling)
│   ├── Models/                       # Data models and DTOs
│   ├── Repositories/                 # Data access layer
│   ├── Services/                     # Business logic layer
│   ├── Program.cs                    # Application entry point
│   └── appsettings.json              # Configuration
├── InventoryManagement.Api.Tests/    # Backend unit/integration tests
├── frontend/                         # Angular frontend
│   ├── src/                          # Application source code
│   └── package.json                  # Frontend dependencies
└── InventoryManagement.sln           # Visual Studio solution file
```

## Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) database server
- [Angular CLI](https://angular.dev/tools/cli) (v19+)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd my-exploration-dotnet-angular
```

### 2. Configure the Backend

1. Navigate to the API directory:
   ```bash
   cd InventoryManagement.Api
   ```

2. Set up your database connection in `appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=inventory_management;Username=postgres;Password=yourpassword"
     },
     "Jwt": {
       "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!"
     }
   }
   ```

   > **Security Note:** For production, use [User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) or environment variables. See `SECRETS_SETUP.md` for instructions.

3. Restore dependencies and apply migrations:
   ```bash
   dotnet restore
   dotnet ef database update
   ```

### 3. Configure the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Backend API

```bash
cd InventoryManagement.Api
dotnet run
```

The API will be available at:
- **HTTP:** `http://localhost:5000` (or configured port)
- **Swagger UI:** `http://localhost:<port>/swagger`

### Frontend

```bash
cd frontend
ng serve
```

The application will be available at `http://localhost:4200/` with hot-reload enabled.

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `dotnet run` | Start the API development server |
| `dotnet build` | Build the project |
| `dotnet test` | Run backend tests |
| `dotnet ef migrations add <name>` | Create a new database migration |
| `dotnet ef database update` | Apply pending migrations |

### Frontend

| Command | Description |
|---------|-------------|
| `ng serve` | Start development server at `http://localhost:4200/` |
| `ng build` | Build the project for production |
| `ng test` | Run unit tests with Karma |
| `ng generate component <name>` | Generate a new Angular component |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate and receive JWT token

### Inventory
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/{id}` - Get a specific inventory item
- `POST /api/inventory` - Create a new inventory item
- `PUT /api/inventory/{id}` - Update an inventory item
- `DELETE /api/inventory/{id}` - Delete an inventory item

> Note: Inventory endpoints require JWT authentication.

## Architecture

### Backend Pattern
The backend follows a layered architecture:

```
Controllers → Services → Repositories → Database
```

- **Controllers:** Handle HTTP requests and responses
- **Services:** Contain business logic
- **Repositories:** Handle data access operations
- **Models:** Define data structures and DTOs

### CORS Configuration
The backend is configured to allow requests from `http://localhost:4200` (Angular dev server). Update the CORS policy in `Program.cs` for different environments.

## Testing

### Backend Tests
```bash
cd InventoryManagement.Api.Tests
dotnet test
```

### Frontend Tests
```bash
cd frontend
ng test
```

## Database Migrations

When you modify the Entity Core models, create a new migration:

```bash
cd InventoryManagement.Api
dotnet ef migrations add <DescriptiveName>
dotnet ef database update
```

## License

[Add your license here]
