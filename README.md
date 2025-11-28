# Artha

A full-stack web application with Node.js backend and React frontend.

## Features

- User authentication (register/login)
- JWT-based authorization
- RESTful API endpoints
- React frontend with modern UI
- Docker containerization
- MongoDB database

## Quick Start

### Development

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Start with Docker Compose:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- MongoDB: localhost:27017

### Production

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Health Check
- `GET /api/health` - API health status

## Project Structure

```
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Custom middleware
│   │   └── server.js       # Entry point
│   └── Dockerfile
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   └── Dockerfile
└── docker-compose*.yml     # Container orchestration
```

## Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create `backend/.env` from `backend/.env.example` and configure:

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - JWT expiration time
- `CORS_ORIGIN` - Frontend URL for CORS