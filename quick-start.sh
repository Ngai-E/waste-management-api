#!/bin/bash

# Waste Management API - Quick Start Script
# This script helps you get started quickly with the API

set -e

echo "🚀 Waste Management API - Quick Start"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 20"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Warning: Node.js version is $NODE_VERSION. Recommended version is >= 20"
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Make sure PostgreSQL is installed and running."
else
    echo "✅ PostgreSQL found: $(psql --version)"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please edit .env file with your configuration before proceeding"
    echo ""
    echo "Required configuration:"
    echo "  - Database credentials (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE)"
    echo "  - JWT secrets (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET)"
    echo ""
    read -p "Press Enter after you've configured .env file..."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🗄️  Database setup..."
read -p "Have you created the PostgreSQL database? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please create the database first:"
    echo "  createdb waste_management"
    echo ""
    echo "Or using psql:"
    echo "  psql -U postgres"
    echo "  CREATE DATABASE waste_management;"
    echo ""
    exit 1
fi

echo ""
echo "📝 Running database migrations..."
npm run migration:run || echo "⚠️  No migrations to run yet. You may need to generate them first."

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo ""
echo "1. Start the development server:"
echo "   npm run start:dev"
echo ""
echo "2. Access the API:"
echo "   API: http://localhost:3000/api/v1"
echo "   Swagger Docs: http://localhost:3000/api/docs"
echo ""
echo "3. Create an admin user (see SETUP.md for instructions)"
echo ""
echo "4. Test the API using the Swagger documentation"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview"
echo "   - SETUP.md - Detailed setup guide"
echo "   - API_REFERENCE.md - Complete API documentation"
echo "   - PROJECT_SUMMARY.md - Project summary"
echo ""
echo "🎉 Happy coding!"
