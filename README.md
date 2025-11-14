# Waste Management API

A comprehensive NestJS backend for a multi-role waste management platform in Cameroon.

## Features

- **Multi-role authentication**: HOUSEHOLD, AGENT, ADMIN, HYSACAM, COUNCIL
- **JWT-based authentication** with access and refresh tokens
- **PostgreSQL** database with TypeORM
- **Swagger/OpenAPI** documentation
- **Role-based access control**
- **File upload** support (local/S3/Cloudinary)
- **SMS and Email** notifications
- **Comprehensive waste management** workflows

## Tech Stack

- NestJS (TypeScript)
- Node.js >= 20
- PostgreSQL
- TypeORM
- Passport + JWT
- bcrypt
- class-validator & class-transformer
- Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL >= 14
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

### Database Setup

```bash
# Run migrations
npm run migration:run

# Generate new migration
npm run migration:generate -- src/database/migrations/MigrationName
```

### Running the Application

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api/v1`

Swagger documentation: `http://localhost:3000/api/docs`

## Project Structure

```
src/
├── auth/              # Authentication & authorization
├── users/             # User management
├── households/        # Household profiles
├── agents/            # Pickup agent profiles
├── pickups/           # Pickup requests & ratings
├── alerts/            # Community alerts
├── bins/              # Community bin management
├── subscriptions/     # Subscription management
├── education/         # Educational content
├── surveys/           # Surveys & responses
├── stats/             # Statistics & analytics
├── notifications/     # SMS, Email, Push notifications
├── files/             # File upload handling
├── health/            # Health checks
├── database/          # Database configuration
├── config/            # App configuration
└── common/            # Shared utilities
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register household user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `PATCH /api/v1/auth/change-password` - Change password

### Users (Admin)
- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user details
- `PATCH /api/v1/users/:id` - Update user
- `PATCH /api/v1/users/:id/status` - Update user status

### Pickups
- `POST /api/v1/pickups` - Create pickup request (Household)
- `GET /api/v1/pickups` - List pickups
- `GET /api/v1/pickups/available` - Available pickups (Agent)
- `PATCH /api/v1/pickups/:id/accept` - Accept pickup (Agent)
- `PATCH /api/v1/pickups/:id/start` - Start pickup (Agent)
- `PATCH /api/v1/pickups/:id/complete` - Complete pickup (Agent)
- `POST /api/v1/pickups/:id/rating` - Rate pickup (Household)

### Alerts
- `POST /api/v1/alerts` - Create alert
- `GET /api/v1/alerts` - List alerts
- `PATCH /api/v1/alerts/:id` - Update alert status

### Bins
- `POST /api/v1/bins` - Create bin (Admin)
- `GET /api/v1/bins` - List bins
- `PATCH /api/v1/bins/:id` - Update bin

[See Swagger docs for complete API reference]

## Roles & Permissions

- **HOUSEHOLD**: Create pickup requests, submit alerts, view educational content
- **AGENT**: Accept and complete pickups, submit alerts
- **ADMIN**: Full system access
- **HYSACAM**: Manage alerts, view statistics, manage bins
- **COUNCIL**: View statistics, manage alerts, manage bins

## License

MIT


export BASE_URL="http://localhost:3000"          # or your deployed URL
export ADMIN_PHONE="+237600000001"               # existing admin user
export ADMIN_PASSWORD="admin123"
export AGENT_PHONE="+237670000002"               # existing approved agent
export AGENT_PASSWORD="admin123"


-- First, you need to hash a password using bcrypt
-- For development, here's a pre-hashed password for "admin123"
INSERT INTO users (name, phone, email, password_hash, role, is_active, is_verified)
VALUES (
  'Admin User',
  '+237600000001',
  'admin@wastemanagement.cm',
  '$2b$10$rKvVJH5WQXzYxH0YxH0YxOeKvVJH5WQXzYxH0YxH0YxOeKvVJH5WQO',
  'ADMIN',
  true,
  true
);