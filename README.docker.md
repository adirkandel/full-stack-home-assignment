# Running with Docker

This guide explains how to run the entire Task Manager application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Build and start all services:**

```bash
docker-compose up --build
```

This will start:
- PostgreSQL database (port 5432)
- Backend API (port 3000)
- Frontend (port 80)

2. **Access the application:**

- Frontend: http://localhost
- Backend API: http://localhost:3000/api

## Docker Commands

### Start all services (detached mode)
```bash
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove all data (including database volumes)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild containers
```bash
docker-compose up --build
```

### Restart a specific service
```bash
docker-compose restart backend
```

## Services

### PostgreSQL Database
- **Container:** task-manager-db
- **Port:** 5432
- **Credentials:**
  - User: taskmanager
  - Password: taskmanager123
  - Database: taskmanager

### Backend API
- **Container:** task-manager-backend
- **Port:** 3000
- **Built from:** `./backend/Dockerfile`
- **Automatically runs:** migrations and database seeding on startup

### Frontend
- **Container:** task-manager-frontend
- **Port:** 80 (HTTP)
- **Built from:** `./frontend/Dockerfile`
- **Served by:** Nginx

## Development vs Production

### Development Mode

For development with hot-reload, you can use volume mounts. Create a `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    volumes:
      - ./backend/src:/app/src
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: base
    volumes:
      - ./frontend/src:/app/src
    command: npm run dev
    ports:
      - "5173:5173"
```

Then run:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Production Mode

The default `docker-compose.yml` is configured for production with optimized builds.

## Troubleshooting

### Port conflicts
If ports 80, 3000, or 5432 are already in use, you can modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Frontend on port 8080
  - "4000:3000"  # Backend on port 4000
  - "5433:5432"  # Postgres on port 5433
```

### Database not ready
The backend waits for PostgreSQL to be healthy before starting. If you see connection errors, wait a few seconds for the database to initialize.

### Clear everything and start fresh
```bash
docker-compose down -v
docker-compose up --build
```

### View container status
```bash
docker-compose ps
```

### Access container shell
```bash
# Backend
docker exec -it task-manager-backend sh

# Frontend
docker exec -it task-manager-frontend sh

# Database
docker exec -it task-manager-db psql -U taskmanager -d taskmanager
```

## Environment Variables

Environment variables are defined in `docker-compose.yml`. To customize:

1. Create a `.env` file in the root directory
2. Override any variables:

```env
JWT_SECRET=your-custom-secret
PORT=4000
```

## Default Test Users

After the database is seeded, you can login with:

- Email: `john@example.com`, Password: `password123`
- Email: `jane@example.com`, Password: `password123`
- Email: `bob@example.com`, Password: `password123`
