# Waste Management API - Setup Guide

## 🎉 Project Successfully Generated!

A complete NestJS backend for a multi-role waste management platform in Cameroon has been created.

## 📋 What Was Created

### Project Structure
```
waste-management-api/
├── src/
│   ├── auth/                 # JWT authentication with access/refresh tokens
│   ├── users/                # User management (Admin)
│   ├── households/           # Household profiles & stats
│   ├── agents/               # Pickup agent profiles & KYC
│   ├── pickups/              # Pickup requests workflow & ratings
│   ├── alerts/               # Community alerts (bins, dumping, etc.)
│   ├── bins/                 # Community bin management
│   ├── subscriptions/        # Subscription management
│   ├── education/            # Educational content
│   ├── surveys/              # Surveys & responses
│   ├── stats/                # Platform statistics
│   ├── notifications/        # SMS, Email, Push (placeholders)
│   ├── files/                # File upload handling
│   ├── health/               # Health checks
│   ├── database/             # TypeORM configuration
│   ├── config/               # App configuration
│   ├── common/               # Shared utilities
│   │   ├── enums/           # Role, Status enums
│   │   ├── decorators/      # @CurrentUser, @Roles, @Public
│   │   ├── guards/          # JWT, Roles guards
│   │   └── dto/             # Pagination DTO
│   ├── main.ts              # Application entry point
│   └── app.module.ts        # Root module
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .env.example
├── .gitignore
└── README.md
```

### Key Features Implemented

#### 🔐 Authentication & Authorization
- **JWT-based auth** with access & refresh tokens
- **5 user roles**: HOUSEHOLD, AGENT, ADMIN, HYSACAM, COUNCIL
- **Guards**: JwtAuthGuard, RolesGuard, OptionalJwtGuard
- **Decorators**: @CurrentUser(), @Roles(), @Public()
- **Endpoints**:
  - `POST /auth/register` - Register household user
  - `POST /auth/login` - Login with phone/password
  - `POST /auth/refresh` - Refresh access token
  - `POST /auth/logout` - Logout
  - `PATCH /auth/change-password` - Change password

#### 👥 User Management
- User CRUD operations (Admin only)
- User status management
- Profile management for households and agents

#### 🏠 Household Module
- Profile management
- Pickup statistics
- Subscription status tracking

#### 🚛 Pickup Agent Module
- Agent profiles with KYC verification
- Performance tracking (ratings, completed pickups)
- Admin KYC approval workflow

#### 📦 Pickups Module (Full Workflow)
- **Household**: Create pickup requests
- **Agent**: View available pickups, accept, start, complete
- **Workflow**: REQUESTED → ASSIGNED → ON_GOING → COMPLETED
- Photo proof upload on completion
- Rating system (1-5 stars with comments)
- Automatic agent rating calculation

#### 🚨 Alerts Module
- Report issues: FULL_BIN, ILLEGAL_DUMPING, MISSED_PICKUP, OTHER
- GPS coordinates & photo attachments
- Status tracking: OPEN → IN_PROGRESS → RESOLVED
- Admin/HYSACAM/Council resolution workflow

#### 🗑️ Community Bins
- Bin location management (GPS coordinates)
- Capacity level tracking (LOW, MEDIUM, HIGH, FULL)
- Last emptied timestamp
- Public bin listing

#### 💳 Subscriptions
- Subscription plans (MONTHLY, PER_PICKUP)
- Status tracking (ACTIVE, EXPIRED, CANCELED)
- Household subscription management

#### 📚 Educational Content
- Multi-language support (EN, FR)
- Multiple content types (ARTICLE, VIDEO, IMAGE, PDF)
- Target audience filtering (HOUSEHOLD, AGENT, SCHOOL, GENERAL)
- Public access to published content

#### 📊 Surveys
- Create surveys with JSON question structure
- Target group filtering
- Response collection
- Admin analytics access

#### 📈 Statistics
- Platform overview (total pickups, users, agents, alerts)
- Pickup statistics with date filtering
- Agent performance leaderboard
- Status breakdowns

#### 📁 File Upload
- Local file storage (development)
- S3/Cloudinary ready structure
- Secure file upload endpoint

#### 🔔 Notifications (Placeholder)
- SMS provider integration ready (Twilio)
- Email provider integration ready (SendGrid/Mailgun)
- Push notifications structure (Firebase)

#### ❤️ Health Checks
- Database connectivity check
- `/health` endpoint for monitoring

### Database Entities

11 TypeORM entities with proper relationships:
1. **User** - Core user entity with role-based access
2. **HouseholdProfile** - Extended household data
3. **PickupAgentProfile** - Agent KYC & performance
4. **PickupRequest** - Pickup workflow management
5. **Rating** - Pickup ratings & reviews
6. **CommunityBin** - Bin locations & capacity
7. **Alert** - Community issue reporting
8. **Subscription** - Subscription management
9. **EducationalContent** - Educational resources
10. **Survey** - Survey definitions
11. **SurveyResponse** - Survey submissions

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd waste-management-api
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update:
- Database credentials (PostgreSQL)
- JWT secrets (use strong random strings)
- CORS origins
- Optional: SMS, Email, Storage providers

### 3. Setup PostgreSQL Database

```bash
# Create database
createdb waste_management

# Or using psql
psql -U postgres
CREATE DATABASE waste_management;
```

### 4. Run Database Migrations

```bash
# Generate initial migration (after first run)
npm run migration:generate -- src/database/migrations/InitialSchema

# Run migrations
npm run migration:run
```

### 5. Start Development Server

```bash
npm run start:dev
```

The API will be available at:
- **API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs

## 📖 API Documentation

Once running, visit **http://localhost:3000/api/docs** for interactive Swagger documentation.

### Sample API Calls

#### Register a Household User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+237670000000",
    "email": "john@example.com",
    "password": "password123",
    "address": "123 Main St, Douala",
    "quarter": "Bonamoussadi"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+237670000000",
    "password": "password123"
  }'
```

#### Create Pickup Request (Household)
```bash
curl -X POST http://localhost:3000/api/v1/pickups \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduledDate": "2024-01-15",
    "timeWindow": "08:00-10:00",
    "wasteType": "MIXED",
    "notes": "Large items included"
  }'
```

## 🔧 Next Steps

### 1. Create Admin User
You'll need to manually create an admin user in the database:

```sql
INSERT INTO users (id, name, phone, password_hash, role, is_active, is_verified)
VALUES (
  gen_random_uuid(),
  'Admin User',
  '+237600000000',
  '$2b$10$...',  -- Hash of your password using bcrypt
  'ADMIN',
  true,
  true
);
```

Or create a seeder script.

### 2. Implement Notification Providers

Update these files with actual provider implementations:
- `src/notifications/notifications.service.ts` - Add Twilio/SendGrid integration
- Configure API keys in `.env`

### 3. Implement File Storage

Choose and configure:
- **Local**: Already implemented (development)
- **S3**: Add AWS SDK and update `src/files/files.service.ts`
- **Cloudinary**: Add Cloudinary SDK and update service

### 4. Add Database Migrations

```bash
# After making entity changes
npm run migration:generate -- src/database/migrations/YourMigrationName
npm run migration:run
```

### 5. Frontend Integration

The API is ready for:
- **Flutter mobile apps** (Household & Agent)
- **React admin dashboard** (Admin, HYSACAM, Council)

All endpoints return JSON and support CORS.

## 🏗️ Architecture Highlights

### Multi-Role System
- **HOUSEHOLD**: Create pickups, submit alerts, view education
- **AGENT**: Accept/complete pickups, submit alerts, view stats
- **ADMIN**: Full system access, user management
- **HYSACAM**: Manage alerts, bins, view statistics
- **COUNCIL**: View statistics, manage alerts/bins

### Security
- Password hashing with bcrypt
- JWT access tokens (short-lived)
- JWT refresh tokens (long-lived)
- Role-based access control
- Input validation with class-validator

### Scalability
- Modular architecture
- TypeORM for database abstraction
- Configurable providers (SMS, Email, Storage)
- Pagination support
- Health checks for monitoring

## 📝 Development Commands

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Linting
npm run lint

# Testing
npm run test
npm run test:e2e
npm run test:cov

# Database
npm run migration:generate -- src/database/migrations/Name
npm run migration:run
npm run migration:revert
```

## 🐛 Troubleshooting

### TypeScript Errors
All TypeScript errors are due to missing dependencies. Run `npm install` to resolve.

### Database Connection
Ensure PostgreSQL is running and credentials in `.env` are correct.

### Port Already in Use
Change `PORT` in `.env` file.

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Passport JWT](http://www.passportjs.org/packages/passport-jwt/)
- [Class Validator](https://github.com/typestack/class-validator)

## 🎯 Production Checklist

Before deploying to production:

- [ ] Change all JWT secrets to strong random values
- [ ] Set `NODE_ENV=production`
- [ ] Disable TypeORM synchronize (use migrations only)
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS
- [ ] Configure production database
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Add API versioning strategy
- [ ] Set up backup strategy
- [ ] Configure SMS/Email providers
- [ ] Set up file storage (S3/Cloudinary)
- [ ] Add comprehensive error handling
- [ ] Implement audit logging
- [ ] Set up CI/CD pipeline

## 🤝 Support

For issues or questions about the implementation, refer to the inline code comments and NestJS documentation.

---

**Generated with ❤️ for TechWomen Cameroon Waste Management Platform**
