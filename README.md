# 🌱 Freshroot Farms API

Backend API for **Freshroot Farms** — a farm-to-consumer platform managing customers, subscriptions, orders, deliveries, kitchen garden setups, vegetables & pricing, expenses, payments, and support tickets.

Built with [NestJS](https://nestjs.com/) + [Prisma](https://www.prisma.io/) + PostgreSQL.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the App](#running-the-app)
- [API Routes](#api-routes)
- [Authentication](#authentication)
- [Seeding the Database](#seeding-the-database)
- [File Uploads](#file-uploads)
- [Troubleshooting](#troubleshooting)
- [Scripts Reference](#scripts-reference)

---

## Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Framework  | NestJS 11                            |
| Language   | TypeScript (ESM)                     |
| ORM        | Prisma 7 (with `@prisma/adapter-pg`) |
| Database   | PostgreSQL                           |
| Auth       | JWT (`@nestjs/jwt` + Passport)       |
| Validation | class-validator / class-transformer  |
| Runtime    | Node.js >= 18.x                      |

---

## Project Structure

```
freshroot-api/
├── prisma/
│   ├── schema.prisma            # Database schema (14 models)
│   ├── seed.ts                  # Main seed script
│   ├── seed-vegetables.ts       # Vegetable catalog seed
│   ├── seed-orders-prices.ts    # Orders & pricing seed
│   └── migrations/              # Auto-generated migrations
├── generated/
│   └── prisma/                  # Generated Prisma client
├── src/
│   ├── main.ts                  # App entry point (port 4000)
│   ├── app.module.ts            # Root module
│   ├── app.controller.ts        # Health-check endpoint
│   ├── prisma/
│   │   ├── prisma.module.ts     # Global Prisma module
│   │   └── prisma.service.ts    # Prisma client service
│   └── modules/
│       ├── admin/               # Admin dashboard & reports
│       ├── analytics/           # Revenue, trends, top vegetables
│       ├── auth/                # JWT login & guards
│       ├── customers/           # Customer CRUD
│       ├── dashboard/           # Customer dashboard
│       ├── deliveries/          # Delivery CRUD
│       ├── expenses/            # Expense tracking (with file upload)
│       ├── kitchen-garden/      # Kitchen garden + visits CRUD
│       ├── orders/              # Order CRUD
│       ├── payments/            # Payment CRUD
│       ├── pricing/             # Vegetable pricing
│       ├── subscriptions/       # Subscription CRUD
│       ├── support/             # Support tickets & messages
│       ├── users/               # Admin user management
│       └── vegetables/          # Vegetable catalog & availability
├── uploads/                     # Uploaded files (expenses, support)
├── .env                         # Environment variables (not committed)
├── .env.example                 # Example env file
├── prisma.config.ts             # Prisma CLI config
├── tsconfig.json
├── nest-cli.json
└── package.json
```

Each module follows the pattern:

```
module-name/
├── dto/
│   ├── module-name.dto.ts       # Create & Update DTOs with validation
│   └── index.ts                 # Barrel export
├── module-name.controller.ts    # Route handlers
├── module-name.service.ts       # Business logic
└── module-name.module.ts        # NestJS module definition
```

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** >= 18.x — [Download](https://nodejs.org/)
- **npm** >= 9.x (comes with Node.js)
- **PostgreSQL** >= 14 — installed locally **or** via [Docker](#using-docker-for-postgres)
- **Docker** (optional) — [Download](https://www.docker.com/products/docker-desktop/)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/SaranpreetSingh-CP/Freshroot-api.git
cd Freshroot-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your local database credentials (see [Environment Variables](#environment-variables)).

### 4. Start PostgreSQL

#### Option A: Using Docker (recommended)

```bash
docker run -d --name freshroot-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=freshroot \
  -p 5432:5432 \
  postgres:17
```

#### Option B: Using Homebrew (macOS)

```bash
brew install postgresql@17
brew services start postgresql@17

# Create the database
createdb freshroot
```

#### Option C: Using an existing PostgreSQL instance

Update `DATABASE_URL` in `.env` with your connection string.

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Run database migrations

```bash
npx prisma migrate deploy
```

> **First-time setup or schema mismatch?** Use `npx prisma db push --force-reset` to force-sync the schema (drops all data).

### 7. Seed the database

```bash
npm run seed
```

### 8. Start the development server

```bash
npm run start:dev
```

The API will be available at **http://localhost:4000/api** 🚀

---

## Environment Variables

Create a `.env` file in the project root (use `.env.example` as a template):

```env
# Database connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/freshroot"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRATION="7d"

# Server
PORT=4000
```

| Variable         | Description                       | Default |
| ---------------- | --------------------------------- | ------- |
| `DATABASE_URL`   | PostgreSQL connection string      | —       |
| `JWT_SECRET`     | Secret key for signing JWT tokens | —       |
| `JWT_EXPIRATION` | Token expiry duration             | `7d`    |
| `PORT`           | Server port                       | `4000`  |

---

## Database Setup

### Prisma Models (14 total)

| Model                   | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `User`                  | Admin users (email/password login)             |
| `Customer`              | Farm customers (name, phone, address)          |
| `Subscription`          | Recurring delivery plans (STF, KG, Land, etc.) |
| `Order`                 | Customer orders with items (JSON) & amounts    |
| `Delivery`              | Delivery tracking per subscription             |
| `KitchenGarden`         | Kitchen garden setups at customer locations    |
| `KGVisit`               | Maintenance visit logs for gardens             |
| `Expense`               | Business expense records (with receipt upload) |
| `Payment`               | Customer payment records                       |
| `SupportTicket`         | Customer support tickets                       |
| `SupportMessage`        | Chat messages on support tickets               |
| `Vegetable`             | Vegetable catalog (seasonal, staple, exotic)   |
| `VegetableAvailability` | Month-based vegetable availability             |
| `VegetablePrice`        | Date-based vegetable pricing                   |

### Useful Prisma commands

```bash
# Open Prisma Studio (visual DB browser)
npx prisma studio

# Create a new migration after schema changes
npx prisma migrate dev --name your_migration_name

# Deploy migrations (production)
npx prisma migrate deploy

# Reset database (drops all data and re-applies migrations)
npx prisma db push --force-reset

# Generate client after schema changes
npx prisma generate
```

---

## Running the App

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

---

## API Routes

All routes are prefixed with `/api`. Routes marked with 🔒 require a JWT Bearer token.

### Root

| Method | Endpoint | Description  |
| ------ | -------- | ------------ |
| `GET`  | `/api`   | Health check |

### Auth (`/api/auth`)

| Method | Endpoint          | Description                 |
| ------ | ----------------- | --------------------------- |
| `POST` | `/api/auth/login` | Admin login (returns JWT)   |
| `GET`  | `/api/auth/me`    | 🔒 Get current user profile |

### Users (`/api/users`) — 🔒 All endpoints

| Method   | Endpoint         | Description       |
| -------- | ---------------- | ----------------- |
| `POST`   | `/api/users`     | Create admin user |
| `GET`    | `/api/users`     | List all users    |
| `GET`    | `/api/users/:id` | Get user by ID    |
| `PUT`    | `/api/users/:id` | Update user       |
| `DELETE` | `/api/users/:id` | Delete user       |

### Customers (`/api/customers`)

| Method   | Endpoint                     | Description                    |
| -------- | ---------------------------- | ------------------------------ |
| `POST`   | `/api/customers`             | Create customer                |
| `GET`    | `/api/customers`             | List all customers             |
| `GET`    | `/api/customers/:id`         | Get customer by ID             |
| `GET`    | `/api/customers/:id/details` | Get customer with full details |
| `PATCH`  | `/api/customers/:id`         | Update customer                |
| `DELETE` | `/api/customers/:id`         | Delete customer                |

### Subscriptions (`/api/subscriptions`) — 🔒 All endpoints

| Method   | Endpoint                                  | Description                   |
| -------- | ----------------------------------------- | ----------------------------- |
| `POST`   | `/api/subscriptions`                      | Create subscription           |
| `GET`    | `/api/subscriptions`                      | List all subscriptions        |
| `GET`    | `/api/subscriptions/:id`                  | Get subscription by ID        |
| `GET`    | `/api/subscriptions/customer/:customerId` | Get subscriptions by customer |
| `PUT`    | `/api/subscriptions/:id`                  | Update subscription           |
| `DELETE` | `/api/subscriptions/:id`                  | Delete subscription           |

### Orders (`/api/orders`)

| Method   | Endpoint                         | Description             |
| -------- | -------------------------------- | ----------------------- |
| `POST`   | `/api/orders`                    | Create order            |
| `GET`    | `/api/orders`                    | List all orders         |
| `GET`    | `/api/orders/:id`                | Get order by ID         |
| `PATCH`  | `/api/orders/:id`                | Update order            |
| `PATCH`  | `/api/orders/:id/status`         | Update order status     |
| `PATCH`  | `/api/orders/:id/mark-delivered` | Mark order as delivered |
| `DELETE` | `/api/orders/:id`                | Delete order            |

### Deliveries (`/api/deliveries`)

| Method   | Endpoint                     | Description            |
| -------- | ---------------------------- | ---------------------- |
| `POST`   | `/api/deliveries`            | Create delivery        |
| `GET`    | `/api/deliveries`            | List all deliveries    |
| `GET`    | `/api/deliveries/:id`        | Get delivery by ID     |
| `PATCH`  | `/api/deliveries/:id`        | Update delivery        |
| `PATCH`  | `/api/deliveries/:id/status` | Update delivery status |
| `DELETE` | `/api/deliveries/:id`        | Delete delivery        |

### Kitchen Garden (`/api/kg`) — 🔒 All endpoints

| Method   | Endpoint               | Description               |
| -------- | ---------------------- | ------------------------- |
| `POST`   | `/api/kg`              | Create kitchen garden     |
| `GET`    | `/api/kg`              | List all kitchen gardens  |
| `GET`    | `/api/kg/:id`          | Get kitchen garden by ID  |
| `PUT`    | `/api/kg/:id`          | Update kitchen garden     |
| `DELETE` | `/api/kg/:id`          | Delete kitchen garden     |
| `POST`   | `/api/kg/:kgId/visits` | Create visit for a garden |
| `GET`    | `/api/kg/:kgId/visits` | List visits for a garden  |
| `GET`    | `/api/kg/visits/:id`   | Get visit by ID           |
| `PUT`    | `/api/kg/visits/:id`   | Update visit              |
| `DELETE` | `/api/kg/visits/:id`   | Delete visit              |

### Expenses (`/api/expenses`)

| Method   | Endpoint            | Description                          |
| -------- | ------------------- | ------------------------------------ |
| `POST`   | `/api/expenses`     | Create expense (file upload: `file`) |
| `GET`    | `/api/expenses`     | List all expenses                    |
| `GET`    | `/api/expenses/:id` | Get expense by ID                    |
| `PATCH`  | `/api/expenses/:id` | Update expense (file upload: `file`) |
| `DELETE` | `/api/expenses/:id` | Delete expense                       |

### Payments (`/api/payments`) — 🔒 All endpoints

| Method   | Endpoint            | Description       |
| -------- | ------------------- | ----------------- |
| `POST`   | `/api/payments`     | Create payment    |
| `GET`    | `/api/payments`     | List all payments |
| `GET`    | `/api/payments/:id` | Get payment       |
| `PUT`    | `/api/payments/:id` | Update payment    |
| `DELETE` | `/api/payments/:id` | Delete payment    |

### Support Tickets (`/api/support/tickets`)

| Method  | Endpoint                                    | Description                   |
| ------- | ------------------------------------------- | ----------------------------- |
| `POST`  | `/api/support/tickets`                      | Create ticket (file: `image`) |
| `GET`   | `/api/support/tickets`                      | List all tickets              |
| `GET`   | `/api/support/tickets/customer/:customerId` | Get tickets by customer       |
| `GET`   | `/api/support/tickets/:id`                  | Get ticket with messages      |
| `POST`  | `/api/support/tickets/:id/messages`         | Add message to ticket         |
| `PATCH` | `/api/support/tickets/:id/status`           | Update ticket status          |

### Vegetables (`/api/vegetables`)

| Method | Endpoint                    | Description                                |
| ------ | --------------------------- | ------------------------------------------ |
| `GET`  | `/api/vegetables`           | List all vegetables                        |
| `GET`  | `/api/vegetables/available` | Vegetables available in month (`?month=N`) |
| `GET`  | `/api/vegetables/:id`       | Get vegetable with availability            |

### Pricing (`/api/vegetable-prices`)

| Method | Endpoint                | Description                             |
| ------ | ----------------------- | --------------------------------------- |
| `POST` | `/api/vegetable-prices` | Create/upsert vegetable prices          |
| `GET`  | `/api/vegetable-prices` | Get prices by date (`?date=YYYY-MM-DD`) |

### Dashboard (`/api/dashboard`)

| Method | Endpoint                      | Description            |
| ------ | ----------------------------- | ---------------------- |
| `GET`  | `/api/dashboard/customer/:id` | Get customer dashboard |

### Admin (`/api/admin`)

| Method | Endpoint                         | Description             |
| ------ | -------------------------------- | ----------------------- |
| `GET`  | `/api/admin/dashboard`           | Admin dashboard summary |
| `GET`  | `/api/admin/upcoming-deliveries` | Upcoming deliveries     |
| `GET`  | `/api/admin/orders-by-date`      | Orders grouped by date  |

### Analytics (`/api/analytics`)

| Method | Endpoint                        | Description                          |
| ------ | ------------------------------- | ------------------------------------ |
| `GET`  | `/api/analytics/summary`        | Revenue/order summary (`?from=&to=`) |
| `GET`  | `/api/analytics/missed`         | Missed deliveries report             |
| `GET`  | `/api/analytics/trend`          | Order trend (`?days=N`, default 7)   |
| `GET`  | `/api/analytics/top-vegetables` | Top-selling vegetables (`?limit=N`)  |

---

## Authentication

The API uses **JWT Bearer tokens**.

### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@freshroot.com", "password": "admin123"}'
```

Response:

```json
{
	"accessToken": "eyJhbGciOi...",
	"user": {
		"id": "...",
		"email": "admin@freshroot.com",
		"name": "Freshroot Admin",
		"role": "admin"
	}
}
```

### Using the token

Add the token to the `Authorization` header for protected routes (🔒):

```bash
curl http://localhost:4000/api/users \
  -H "Authorization: Bearer eyJhbGciOi..."
```

---

## Seeding the Database

The seed script (`prisma/seed.ts`) creates realistic sample data:

| Entity                     | Count | Details                                                     |
| -------------------------- | ----- | ----------------------------------------------------------- |
| Admin User                 | 1     | `admin@freshroot.com` / `admin123`                          |
| Customers                  | 28    | Real customers from STF + KG spreadsheets (deduplicated)    |
| STF/Combined Subscriptions | 21    | Types: STF, KG+STF                                          |
| KG/Land Subscriptions      | 9     | Types: KG, Land, landscape                                  |
| Orders                     | 3     | Sample orders with items                                    |
| Deliveries                 | 2     | Linked to STF subscriptions                                 |
| Kitchen Gardens            | 2     | Linked to KG subscriptions                                  |
| KG Visits                  | 2     | Maintenance visit logs                                      |
| Expenses                   | 5     | Categories: seeds, fertilizer, transport, labour, packaging |
| Payments                   | 3     | Methods: upi, cash, bank_transfer                           |

```bash
npm run seed
```

> **Note:** Ensure the database is running and migrations are applied before seeding.

---

## File Uploads

The API supports file uploads for:

- **Expenses** — bill/receipt upload via `file` field in multipart form data
- **Support Tickets** — image upload via `image` field in multipart form data

Uploaded files are saved to the `uploads/` directory and served statically at `/uploads/`.

---

## Troubleshooting

### Port 4000 already in use

```bash
# Find and kill the process on port 4000
lsof -ti:4000 | xargs kill -9
```

### Database connection refused

Make sure PostgreSQL is running:

```bash
# Docker
docker ps | grep freshroot-db
# If not running:
docker start freshroot-db

# Homebrew (macOS)
brew services list | grep postgresql
brew services start postgresql@17
```

### Schema out of sync

If you get migration errors or null constraint violations after pulling new changes:

```bash
# Force reset and re-sync the schema (drops all data)
npx prisma db push --force-reset

# Re-seed
npm run seed
```

### Prisma client errors

Regenerate the Prisma client after any schema changes:

```bash
npx prisma generate
```

---

## Scripts Reference

| Script        | Command               | Description                    |
| ------------- | --------------------- | ------------------------------ |
| `start`       | `npm run start`       | Start the app                  |
| `start:dev`   | `npm run start:dev`   | Start in watch mode            |
| `start:debug` | `npm run start:debug` | Start in debug + watch mode    |
| `start:prod`  | `npm run start:prod`  | Start production build         |
| `build`       | `npm run build`       | Compile TypeScript             |
| `seed`        | `npm run seed`        | Seed database with sample data |
| `lint`        | `npm run lint`        | Lint and fix code              |
| `format`      | `npm run format`      | Format code with Prettier      |
| `test`        | `npm run test`        | Run unit tests                 |
| `test:e2e`    | `npm run test:e2e`    | Run end-to-end tests           |
| `test:cov`    | `npm run test:cov`    | Run tests with coverage        |

---

## License

This project is UNLICENSED (private).
