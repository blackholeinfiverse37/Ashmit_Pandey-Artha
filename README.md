# Artha

A full-stack web application with Node.js backend and React frontend.

## Features

- User authentication (register/login)
- JWT-based authorization
- RESTful API endpoints
- React frontend with modern UI
- Docker containerization
- MongoDB database
- **Enhanced Hash-Chain Ledger** - Blockchain-inspired tamper-evident journal entries 🆕
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

1. **Setup Environment Variables**:
   ```bash
   # Option 1: Generate secure configuration automatically
   cd backend && npm run generate:config
   
   # Option 2: Manual setup
   cp .env.prod.example .env
   cp backend/.env.production.example backend/.env.production
   # Edit files with your production values
   ```

2. **Deploy with Script** (Recommended):
   ```bash
   # Linux/Mac
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh --seed
   
   # Windows
   scripts\deploy-prod.bat --seed
   ```

3. **Manual Deployment**:
   ```bash
   # Set required environment variables
   export MONGO_ROOT_USER=your_mongo_user
   export MONGO_ROOT_PASSWORD=your_mongo_password
   export REDIS_PASSWORD=your_redis_password
   
   # Deploy
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

4. **Production Features**:
   - MongoDB replica set with transactions
   - Redis caching for performance
   - Nginx reverse proxy with compression
   - Health checks and monitoring
   - Automated backups
   - Security headers and SSL support

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
- `GET /api/v1/ledger/entries/:id/verify-chain` - Verify chain from specific entry (admin) 🆕
- `GET /api/v1/ledger/chain-stats` - Get hash-chain statistics (admin) 🆕
- `GET /api/v1/ledger/verify-chain` - Verify entire ledger chain (admin) 🆕
- `GET /api/v1/ledger/chain-segment` - Get chain segment for audit (admin) 🆕
- `GET /api/v1/ledger/entries/:id/verify` - Verify single entry hash 🆕

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

### Performance Monitoring
- `GET /api/v1/performance/metrics` - Get performance metrics (admin)
- `GET /api/v1/performance/health` - Get performance health status (admin)
- `POST /api/v1/performance/reset` - Reset performance metrics (admin)

### Database Optimization
- `GET /api/v1/database/stats` - Get database statistics (admin)
- `GET /api/v1/database/collections` - Get collection statistics (admin)
- `GET /api/v1/database/indexes` - Get index information (admin)
- `POST /api/v1/database/indexes` - Create all indexes (admin)
- `GET /api/v1/database/optimize` - Get optimization suggestions (admin)

### Health Check
- `GET /health` - Main API health status
- `GET /health/detailed` - Comprehensive system health
- `GET /ready` - Readiness probe (Kubernetes)
- `GET /live` - Liveness probe (Kubernetes)
- `GET /metrics` - Public performance metrics
- `GET /status` - System component status
- `GET /api/health` - Legacy health status

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

### Development
```bash
# Database operations
npm run seed              # Seed database with sample data
npm run verify:seed       # Verify seed data integrity
npm run demo             # Run workflow demonstration

# Testing
npm run test             # Run all tests with coverage
npm run test:seed        # Test seed script functionality
npm run test:cache       # Test Redis caching functionality
npm run test:performance # Test performance monitoring
npm run test:database    # Test database optimization
npm run test:health      # Test health monitoring
npm run test:final       # Run final integration tests

# Verification
npm run verify:server    # Verify server configuration
npm run verify:controllers # Verify controller implementation
npm run verify:insightflow # Verify InsightFlow system
```

### Production
```bash
# Configuration
npm run generate:config           # Generate secure production config
npm run create-indexes            # Create database indexes for optimization
npm run migrate:hash-chain        # Migrate existing entries to enhanced hash-chain 🆕

# Deployment
./scripts/deploy-prod.sh          # Deploy production environment
./scripts/deploy-prod.sh --seed   # Deploy with database seeding

# Backup & Maintenance
./scripts/backup-prod.sh          # Create production backup
docker-compose -f docker-compose.prod.yml logs -f  # View logs
docker-compose -f docker-compose.prod.yml down     # Stop services

# Health Monitoring
curl http://localhost:5000/health          # Basic API health
curl http://localhost:5000/health/detailed # Detailed system health
curl http://localhost:5000/ready           # Readiness probe
curl http://localhost:5000/live            # Liveness probe
curl http://localhost:5000/metrics         # Performance metrics
curl http://localhost:5000/status          # System status
curl http://localhost/health               # Frontend health
```

## ARTHA v0.1-demo Production Deployment Guide

### Prerequisites
- Docker and Docker Compose installed
- Domain name configured (optional, for HTTPS)
- SSL certificates (for HTTPS)
- Minimum 2GB RAM, 20GB disk space
- MongoDB replica set support

### Pre-Deployment Checklist

#### 1. Environment Configuration
```bash
# Copy environment templates
cp .env.production.example .env.production
cp backend/.env.production.example backend/.env.production

# Edit and configure all secrets
nano .env.production
nano backend/.env.production
```

**Critical: Change all default secrets!**
- JWT_SECRET - Minimum 32 characters
- JWT_REFRESH_SECRET - Minimum 32 characters
- HMAC_SECRET - Minimum 32 characters
- MONGO_ROOT_PASSWORD - Strong password
- REDIS_PASSWORD - Strong password

#### 2. SSL Certificates (For HTTPS)
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy your SSL certificates
cp /path/to/cert.pem nginx/ssl/
cp /path/to/key.pem nginx/ssl/

# Update nginx.conf to enable HTTPS server block
```

#### 3. Install Dependencies
```bash
# Backend
cd backend
npm ci --only=production

# Frontend
cd ../frontend
npm ci
```

### Deployment Steps

#### 1. Deploy Application
```bash
# Make scripts executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

The script will:
- Build Docker images
- Start all services
- Initialize MongoDB replica set
- Create database indexes
- Verify service health

#### 2. Initial Setup
```bash
# Seed initial data (first time only)
docker exec artha-backend-prod npm run seed

# Or manually create admin user via API
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "SecurePassword123!",
    "name": "Admin User",
    "role": "admin"
  }'
```

#### 3. Verify Deployment
```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Check health endpoint
curl http://localhost:5000/health/detailed

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Post-Deployment

#### 1. Configure Company Settings
Login and navigate to Settings:
- Set company name, GSTIN, PAN, TAN
- Configure GST filing frequency
- Set up bank accounts

#### 2. Seed Chart of Accounts
```bash
curl -X POST http://localhost:5000/api/v1/accounts/seed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. Setup Backups
```bash
# Add to crontab for daily backups at 2 AM
0 2 * * * /path/to/artha/scripts/backup.sh
```

### Monitoring

#### Health Check Endpoints
- Basic: GET /health
- Detailed: GET /health/detailed
- Readiness: GET /ready
- Liveness: GET /live

#### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker logs artha-backend-prod -f
```

#### Database Access
```bash
# Connect to MongoDB
docker exec -it artha-mongo-prod mongosh -u $MONGO_ROOT_USER -p $MONGO_ROOT_PASSWORD --authenticationDatabase admin
```

### Backup and Restore

#### Create Backup
```bash
./scripts/backup.sh
```
Backups are stored in ./backups/ directory.

#### Restore from Backup
```bash
./scripts/restore.sh backups/artha_backup_YYYYMMDD_HHMMSS.gz
```

### Troubleshooting

#### Services Won't Start
```bash
# Check Docker logs
docker-compose -f docker-compose.prod.yml logs

# Check individual service
docker logs artha-backend-prod --tail 100

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

#### Database Connection Issues
```bash
# Check MongoDB status
docker exec artha-mongo-prod mongosh --eval "db.adminCommand('ping')"

# Check replica set status
docker exec artha-mongo-prod mongosh --eval "rs.status()"
```

#### Memory Issues
```bash
# Check memory usage
docker stats

# Increase Docker memory limits in docker-compose.prod.yml
```

### Security Recommendations
- **Firewall**: Only expose ports 80 and 443
- **SSL**: Always use HTTPS in production
- **Secrets**: Rotate JWT secrets regularly
- **Backups**: Keep encrypted off-site backups
- **Updates**: Keep Docker images updated
- **Monitoring**: Set up alerts for health check failures

### Scaling

#### Horizontal Scaling (Multiple Instances)
- Use load balancer (nginx, HAProxy)
- Shared MongoDB replica set
- Shared Redis for session storage
- Sticky sessions for WebSocket connections

#### Vertical Scaling (More Resources)
Update docker-compose.prod.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### Maintenance

#### Update Application
```bash
# Pull latest code
git pull

# Rebuild and redeploy
./scripts/deploy.sh
```

#### Database Maintenance
```bash
# Compact database
docker exec artha-mongo-prod mongosh --eval "db.runCommand({compact: 'collectionName'})"

# Rebuild indexes
docker exec artha-backend-prod npm run create-indexes
```

### Support
For issues and support:
- GitHub: [repository-url]
- Email: support@yourcompany.com

---

## DAY 6 COMPLETION CHECKLIST

1. **Install Redis dependency**
   ```bash
   cd backend
   npm install redis
   ```

2. **Create all new files** (paste code above)

3. **Make scripts executable**
   ```bash
   chmod +x scripts/deploy.sh
   chmod +x scripts/backup.sh
   chmod +x scripts/restore.sh
   ```

4. **Set up environment files**
   ```bash
   cp .env.production.example .env.production
   cp backend/.env.production.example backend/.env.production
   
   # Edit secrets (IMPORTANT!)
   nano .env.production
   nano backend/.env.production
   ```

5. **Test production build locally**
   ```bash
   ./scripts/deploy.sh
   ```

6. **Create database indexes**
   ```bash
   docker exec artha-backend-prod npm run create-indexes
   ```

7. **Verify all services**
   ```bash
   curl http://localhost:5000/health/detailed
   curl http://localhost/health
   ```

8. **Test backup**
   ```bash
   ./scripts/backup.sh
   ```

9. **View logs**
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

---

## DAY 6 DELIVERABLES ✅

✅ **Production Docker Setup** - Multi-stage builds, health checks, security hardening  
✅ **Redis Caching** - Response caching for improved performance  
✅ **Performance Monitoring** - Request timing, memory monitoring, slow query detection  
✅ **Database Optimization** - Comprehensive indexing strategy  
✅ **Health Checks** - Multiple endpoints for monitoring and orchestration  
✅ **Deployment Scripts** - Automated deployment, backup, restore  
✅ **Production Documentation** - Complete deployment and maintenance guide  
✅ **System Health Dashboard** - Real-time monitoring UI  
✅ **SSL/TLS Support** - Nginx configuration for HTTPS  
✅ **Security Hardening** - Non-root users, secrets management, firewall rules  

---

## 🎉 SPRINT B COMPLETE! 🎉

**All 6 Days Delivered:**

**Sprint A (Days 1-3):**
- ✅ Secure scaffold & authentication
- ✅ Ledger core with double-entry & HMAC chain
- ✅ Invoice & expense management
- ✅ InsightFlow RL experience buffer

**Sprint B (Days 4-6):**
- ✅ India statutory compliance (GST, TDS)
- ✅ Company settings & financial year tracking
- ✅ Comprehensive financial reports (P&L, Balance Sheet, Cash Flow, Trial Balance)
- ✅ Advanced dashboard with KPIs
- ✅ Production deployment infrastructure
- ✅ Performance optimization & caching
- ✅ Monitoring & health checks
- ✅ Automated backup & restore

---

## PROJECT SUMMARY

**ARTHA v0.1-demo** is now a **production-ready, enterprise-grade accounting system** with:

- ✅ 15+ API endpoints fully integrated
- ✅ 10+ database models with proper indexing
- ✅ Double-entry accounting with tamper-evidence
- ✅ India-compliant GST & TDS management
- ✅ Comprehensive financial reporting
- ✅ Role-based access control
- ✅ Audit logging for all actions
- ✅ PDF export capabilities
- ✅ Receipt upload with file management
- ✅ Real-time dashboard analytics
- ✅ Production-ready Docker deployment
- ✅ Redis caching layer
- ✅ Performance monitoring
- ✅ Automated backups
- ✅ Health check endpoints
- ✅ Complete documentation

**Technology Stack:**
- **Backend:** Node.js, Express, MongoDB, Redis
- **Frontend:** React, Vite, TailwindCSS
- **Infrastructure:** Docker, Docker Compose, Nginx
- **Security:** Helmet, JWT, HMAC, rate limiting
- **Standards:** Double-entry accounting, HMAC chain, audit trails

**The system is ready for production deployment!** 🚀

### Available Scripts

| Script | Platform | Purpose |
|--------|----------|----------|
| `scripts/deploy.sh` | Linux/Mac | Production deployment |
| `scripts/deploy-prod.bat` | Windows | Production deployment |
| `scripts/backup.sh` | Linux/Mac | Database backup |
| `scripts/backup-prod.bat` | Windows | Database backup |
| `scripts/restore.sh` | Linux/Mac | Database restore |
| `scripts/make-executable.bat` | Windows | Make scripts executable |

## Environment Variables

Create `backend/.env` from `backend/.env.example` and configure:

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - JWT expiration time
- `CORS_ORIGIN` - Frontend URL for CORS

### Production Environment

For production deployment, create:
- `.env.production` - Root environment variables
- `backend/.env.production` - Backend environment variables

Use `npm run generate:config` to automatically generate secure production configuration.