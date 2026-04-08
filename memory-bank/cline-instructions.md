# Cline Memory Bank - Interview Prep Mode

## Project Context
This is a **fullstack developer job application project** with an interview scheduled for **Friday**. The goal is to build impressive, demonstrable features in a short timeframe that showcase technical competency.

## Quick Reference

### Tech Stack
- **Backend:** .NET 9, ASP.NET Core, Entity Framework Core, PostgreSQL
- **Frontend:** Angular (latest), TypeScript, RxJS
- **Authentication:** JWT tokens
- **Architecture:** Clean Architecture, Repository Pattern

### Current Status
✅ Backend CRUD API complete
✅ Basic Angular service created
🔄 Need: Complete UI polish, authentication, dashboard

### Priority Features (In Order)
1. ✨ **CRUD Operations** - Must work flawlessly with validation & notifications
2. 🔐 **Authentication** - Login/logout with JWT, protected routes
3. 📊 **Dashboard** - Stats cards, low stock alerts (visual impact!)
4. 🎨 **UX Polish** - Loading states, toast notifications, responsive design

### Demo Flow (5 minutes)
1. Login screen → Dashboard
2. Show inventory list with search/filter
3. Create new item (show validation)
4. Edit existing item
5. Delete item (with confirmation)
6. Quick code walkthrough

## Key Files Locations

### Backend
- Controllers: `/InventoryManagement.Api/Controllers/`
- Models: `/InventoryManagement.Api/Models/`
- Services: `/InventoryManagement.Api/Services/`
- Data: `/InventoryManagement.Api/Data/`

### Frontend
- Components: `/frontend/src/app/components/`
- Services: `/frontend/src/app/services/`
- Models: `/frontend/src/app/models/`
- Guards: `/frontend/src/app/guards/`

## Development Commands

### Backend
```bash
cd InventoryManagement.Api
dotnet run
dotnet ef database update
dotnet build
```

### Frontend
```bash
cd frontend
npm install
ng serve
ng build
```

## Interview Talking Points

### Why This Architecture?
- Separation of concerns for maintainability
- Type safety on both ends (C# + TypeScript)
- RESTful API for flexibility
- JWT for stateless authentication

### Technical Decisions
- PostgreSQL: Open-source, reliable, performs well
- EF Core: Rapid development, LINQ support
- Angular: Enterprise-ready, strong typing, comprehensive framework
- Repository Pattern: Testable, swappable data sources

### What I'd Improve With More Time
- Unit tests coverage
- Docker containerization
- CI/CD pipeline
- Advanced features (export, bulk operations, audit trail)

## Common Gotchas to Avoid
- ❌ CORS issues - ensure backend allows frontend origin
- ❌ Token expiration - handle 401 responses gracefully
- ❌ Database connection - verify connection string
- ❌ Port conflicts - check default ports (5000/5001 for .NET, 4200 for Angular)

## Quick Wins for Visual Impact
1. Add loading spinners on all async operations
2. Toast notifications for success/error messages
3. Low stock warning badges in red/yellow
4. Smooth transitions between pages
5. Form validation messages in real-time

## Emergency Checklist (If Running Out of Time)
- [ ] Ensure basic CRUD works without errors
- [ ] Have demo credentials ready (hardcode if needed)
- [ ] Seed database with sample data
- [ ] Test the full demo flow at least once
- [ ] Prepare fallback screenshots/video

## Notes for Cline
When helping with this project:
1. **Prioritize speed** - Suggest quickest viable solution
2. **Focus on demo-able features** - Visual > perfect
3. **Keep code clean but pragmatic** - Can refactor later
4. **Add comments** - Help explain during interview
5. **Error handling** - Make failures graceful and visible

---

**Last Updated:** Wednesday (2 days before interview)
**Next Milestone:** Thursday EOD - Feature complete
**Final Deadline:** Friday morning - Ready for presentation
