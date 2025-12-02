# Artha

A full-stack web application with Node.js backend and React frontend.

## Features

- User authentication (register/login)
- JWT-based authorization
- RESTful API endpoints
- React frontend with modern UI
- Docker containerization
- MongoDB database
- File upload system for receipts
- Expense management with approval workflow
- Invoice management with payment tracking
- InsightFlow RL experience buffer for analytics
- Comprehensive audit logging and telemetry

## Quick Start

### Development

1. Clone the repository
2. Run the setup script:
   ```bash
   # Linux/Mac
   chmod +x scripts/docker-setup.sh
   ./scripts/docker-setup.sh
   
   # Windows
   scripts\docker-setup.bat
   ```

Alternatively, manual setup:
1. Copy environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Start with Docker Compose:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```
3. Seed the database with sample data:
   ```bash
   cd backend
   npm run seed
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: Cloud Atlas (configured in .env)

### Production

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## API Endpoints

### Authentication (Legacy)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout user

### Authentication (V1)
- `POST /api/v1/auth/register` - Register new user (enhanced)
- `POST /api/v1/auth/login` - Login user (enhanced)
- `GET /api/v1/auth/me` - Get current user (enhanced)
- `POST /api/v1/auth/logout` - Logout user

### Chart of Accounts
- `GET /api/v1/accounts` - Get all accounts with filters
- `GET /api/v1/accounts/:id` - Get single account
- `POST /api/v1/accounts` - Create new account (admin/accountant)
- `PUT /api/v1/accounts/:id` - Update account (admin/accountant)
- `DELETE /api/v1/accounts/:id` - Deactivate account (admin)
- `POST /api/v1/accounts/seed` - Seed default accounts (admin)

### Ledger Management
- `GET /api/v1/ledger/entries` - Get journal entries with filters
- `GET /api/v1/ledger/entries/:id` - Get single journal entry
- `POST /api/v1/ledger/entries` - Create journal entry (admin/accountant)
- `POST /api/v1/ledger/entries/:id/post` - Post journal entry (admin/accountant)
- `POST /api/v1/ledger/entries/:id/void` - Void journal entry (admin/accountant)
- `GET /api/v1/ledger/balances` - Get account balances
- `GET /api/v1/ledger/summary` - Get ledger summary
- `GET /api/v1/ledger/verify` - Verify ledger integrity (admin)

### Legacy Ledger Routes (Backward Compatibility)
- `GET /api/v1/ledger/journal-entries` - Get journal entries (legacy)
- `POST /api/v1/ledger/journal-entries` - Create journal entry (legacy)
- `GET /api/v1/ledger/journal-entries/:id` - Get single journal entry (legacy)
- `POST /api/v1/ledger/journal-entries/:id/post` - Post journal entry (legacy)
- `POST /api/v1/ledger/journal-entries/:id/void` - Void journal entry (legacy)
- `GET /api/v1/ledger/verify-chain` - Verify ledger integrity (legacy)

### Reports
- `GET /api/v1/reports/general-ledger` - Export General Ledger as PDF (admin/accountant)

### Invoices
- `GET /api/v1/invoices` - Get all invoices with filters (admin/accountant/manager)
- `GET /api/v1/invoices/stats` - Get invoice statistics (admin/accountant/manager)
- `GET /api/v1/invoices/:id` - Get single invoice (admin/accountant/manager)
- `POST /api/v1/invoices` - Create new invoice (admin/accountant)
- `PUT /api/v1/invoices/:id` - Update invoice (admin/accountant)
- `POST /api/v1/invoices/:id/send` - Send invoice and create AR entry (admin/accountant)
- `POST /api/v1/invoices/:id/payment` - Record payment for invoice (admin/accountant)
- `POST /api/v1/invoices/:id/cancel` - Cancel invoice (admin/accountant)

### Expenses
- `GET /api/v1/expenses` - Get all expenses with filters (admin/accountant/manager)
- `GET /api/v1/expenses/stats` - Get expense statistics (admin/accountant/manager)
- `GET /api/v1/expenses/:id` - Get single expense (admin/accountant/manager/owner)
- `POST /api/v1/expenses` - Create new expense with receipt uploads (all users)
- `PUT /api/v1/expenses/:id` - Update expense with additional receipts (admin/accountant/owner)
- `POST /api/v1/expenses/:id/approve` - Approve expense (admin/accountant)
- `POST /api/v1/expenses/:id/reject` - Reject expense (admin/accountant)
- `POST /api/v1/expenses/:id/record` - Record expense in ledger (admin/accountant)
- `DELETE /api/v1/expenses/:id/receipts/:receiptId` - Delete receipt (admin/accountant/owner)

### InsightFlow (RL Experience Buffer)
- `POST /api/v1/insightflow/experience` - Log RL experience data (all authenticated users)
- `GET /api/v1/insightflow/experiences` - Get RL experiences with filters (admin)
- `GET /api/v1/insightflow/stats` - Get RL experience statistics (admin)

### Health Check
- `GET /health` - Main API health status
- `GET /api/health` - Legacy health status

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
npm run seed    # Seed database with sample data
npm run dev     # Start development server
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Sample Data

The seed script creates:
- **Users**: Admin, Accountant, and Viewer accounts
- **Chart of Accounts**: Complete accounting structure
- **Journal Entries**: Sample transactions (capital, sales, expenses)
- **Sample Invoice**: Acme Corporation invoice with AR integration
- **Sample Expense**: Office supplies expense with ledger recording

### Login Credentials
- **Admin**: admin@artha.local / Admin@123456
- **Accountant**: accountant@artha.local / Accountant@123
- **Viewer**: user@example.com / testuser123

## Scripts

```bash
# Database operations
npm run seed              # Seed database with sample data
npm run verify:seed       # Verify seed data integrity
npm run demo             # Run workflow demonstration

# Testing
npm run test             # Run all tests with coverage
npm run test:seed        # Test seed script functionality
npm run test:final       # Run final integration tests

# Verification
npm run verify:server    # Verify server configuration
npm run verify:controllers # Verify controller implementation
npm run verify:insightflow # Verify InsightFlow system
```

## Environment Variables

Create `backend/.env` from `backend/.env.example` and configure:

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - JWT expiration time
- `CORS_ORIGIN` - Frontend URL for CORS