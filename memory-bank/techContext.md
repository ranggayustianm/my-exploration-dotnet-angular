# Tech Context

## Technologies Used

### Backend

- **.NET** - Modern, cross-platform framework for building the API
- **C#** - Primary backend programming language
- **ASP.NET Core** - Web framework for building RESTful APIs
- **Entity Framework Core** - ORM for data access (planned)

### Frontend

- **Angular** - TypeScript-based frontend framework
- **TypeScript** - Typed JavaScript superset
- **RxJS** - Reactive programming library for handling async operations
- **HTML/CSS** - Markup and styling

### Development Tools

- **Git** - Version control
- **Visual Studio Code** - Primary IDE
- **.NET CLI** - Command-line tools for .NET development
- **Node.js & npm** - JavaScript runtime and package manager

## Development Setup

### Prerequisites

- .NET SDK (version to be determined based on project needs)
- Node.js and npm
- Git
- Code editor (VS Code recommended)

### Environment Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/ranggayustianm/my-exploration-dotnet-angular.git
   ```

2. **Backend Setup** (to be detailed when .NET project is created)

3. **Frontend Setup** (to be detailed when Angular project is created)

### Development Workflow

- **Backend:** Run with `dotnet run` or through IDE
- **Frontend:** Run with `ng serve` for development server
- **API Communication:** Frontend connects to backend API during development

## Technical Constraints

- **CORS:** Cross-origin resource sharing must be configured for frontend-backend communication
- **Port Configuration:** Default ports may need adjustment to avoid conflicts
- **Environment Variables:** Configuration for different environments (dev, prod)

## Dependencies

### Backend Dependencies (Planned)

- ASP.NET Core packages
- Entity Framework Core
- Authentication libraries (JWT, etc.)
- Validation libraries
- Logging frameworks

### Frontend Dependencies (Planned)

- Angular core packages
- Angular Router
- Angular Forms
- RxJS
- Additional UI component libraries (if needed)

## Tool Usage Patterns

### Git Workflow

- Main branch for stable code
- Feature branches for new development
- Commit messages following conventional commits

### Code Quality

- ESLint for TypeScript/JavaScript
- Code formatting standards
- Unit testing frameworks (xUnit/NUnit for backend, Jasmine/Karma for frontend)

### Build and Deployment

- Build scripts for both frontend and backend
- Docker support (planned for containerization)
- CI/CD pipeline (to be implemented)