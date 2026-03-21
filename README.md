# 🌱 Freshroot Farms API

Backend API for **Freshroot Farms** — a farm-to-consumer platform managing customers, orders, deliveries, kitchen garden setups, expenses, and payments.

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
- [Scripts Reference](#scripts-reference)

---

## Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Framework  | NestJS 11                            |
| Language   | TypeScript                           |
| ORM        | Prisma 7 (with `@prisma/adapter-pg`) |
| Database   | PostgreSQL                           |
| Auth       | JWT (`@nestjs/jwt`)                  |
| Validation | class-validator / class-transformer  |
| Runtime    | Node.js (ES2023+)                    |

---

## Project Structure

```
freshroot-api/
├── prisma/
│   ├── schema.prisma          # Database schema (10 models)
│   ├── seed.ts                # Seed script with sample data
│   └── migrations/            # Auto-generated migrations
├── src/
│   ├── main.ts                # App entry point
│   ├── app.module.ts          # Root module
│   ├── app.controller.ts      # Health-check endpoint
│   ├── app.service.ts
│   ├── prisma/
│   │   ├── prisma.module.ts   # Global Prisma module
│   │   └── prisma.service.ts  # Prisma client service
│   └── modules/
│       ├── auth/              # JWT login & guards
│       ├── users/             # Admin user management
│       ├── customers/         # Customer CRUD
│       ├── orders/            # Order CRUD
│       ├── deliveries/        # Delivery CRUD
│       ├── kitchen-garden/    # Kitchen garden + visits CRUD
│       ├── expenses/          # Expense tracking CRUD
│       └── payments/          # Payment CRUD
├── .env                       # Environment variables (not committed)
├── prisma.config.ts           # Prisma CLI config
├── tsconfig.json
├── nest-cli.json
└── package.json
```

Each module follows the pattern:

```
module-name/
├── dto/
│   ├── module-name.dto.ts     # Create & Update DTOs with validation
│   └── index.ts               # Barrel export
├── module-name.controller.ts  # Route handlers
├── module-name.service.ts     # Business logic
└── module-name.module.ts      # NestJS module definition
```

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** >= 18.x — [Download](https://nodejs.org/)
- **npm** >= 9.x (comes with Node.js)
- **PostgreSQL** >= 14 — [Download](https://www.postgresql.org/download/) or use [Docker](#using-docker-for-postgres)

### Using Docker for Postgres

If you don't have PostgreSQL installed locally, spin one up with Docker:

```bash
docker run --name freshroot-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=freshroot \
  -p 5432:5432 \
  -d postgres:16
```

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

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Seed the database (optional)

```bash
npm run seed
```

### 7. Start the development server

```bash
npm run start:dev
```

The API will be available at **http://localhost:4000/api**

---

## Environment Variables

Create a `.env` file in the project root with the following:

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

### Prisma Models

| Model           | Description                                |
| --------------- | ------------------------------------------ |
| `User`          | Admin users (email/password login)         |
| `Customer`      | Farm customers (name, phone, email)        |
| `Address`       | Customer delivery addresses                |
| `Subscription`  | Recurring delivery plans                   |
| `Order`         | Customer orders with items & amounts       |
| `Delivery`      | Delivery tracking per order                |
| `KitchenGarden` | Kitchen garden setups at customer location |
| `KGVisit`       | Maintenance visit logs for gardens         |
| `Expense`       | Business expense records                   |
| `Payment`       | Customer payment records                   |

### Useful Prisma commands

```bash
# Open Prisma Studio (visual DB browser)
npx prisma studio

# Create a new migration after schema changes
npx prisma migrate dev --name your_migration_name

# Reset database (drops all data)
npx prisma migrate reset

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

All routes are prefixed with `/api`. Protected routes require a Bearer token (see [Authentication](#authentication)).

### Public

| Method | Endpoint          | Description  |
| ------ | ----------------- | ------------ |
| `GET`  | `/api`            | Health check |
| `POST` | `/api/auth/login` | Admin login  |

### Protected (require JWT)

| Method   | Endpoint               | Description                 |
| -------- | ---------------------- | --------------------------- |
| `GET`    | `/api/users`           | List all admin users        |
| `POST`   | `/api/users`           | Create admin user           |
| `GET`    | `/api/users/:id`       | Get user by ID              |
| `PUT`    | `/api/users/:id`       | Update user                 |
| `DELETE` | `/api/users/:id`       | Delete user                 |
| `GET`    | `/api/customers`       | List all customers          |
| `POST`   | `/api/customers`       | Create customer             |
| `GET`    | `/api/customers/:id`   | Get customer with relations |
| `PUT`    | `/api/customers/:id`   | Update customer             |
| `DELETE` | `/api/customers/:id`   | Delete customer             |
| `GET`    | `/api/orders`          | List all orders             |
| `POST`   | `/api/orders`          | Create order                |
| `GET`    | `/api/orders/:id`      | Get order details           |
| `PUT`    | `/api/orders/:id`      | Update order                |
| `DELETE` | `/api/orders/:id`      | Delete order                |
| `GET`    | `/api/deliveries`      | List all deliveries         |
| `POST`   | `/api/deliveries`      | Create delivery             |
| `GET`    | `/api/deliveries/:id`  | Get delivery details        |
| `PUT`    | `/api/deliveries/:id`  | Update delivery             |
| `DELETE` | `/api/deliveries/:id`  | Delete delivery             |
| `GET`    | `/api/kg`              | List kitchen gardens        |
| `POST`   | `/api/kg`              | Create kitchen garden       |
| `GET`    | `/api/kg/:id`          | Get kitchen garden          |
| `PUT`    | `/api/kg/:id`          | Update kitchen garden       |
| `DELETE` | `/api/kg/:id`          | Delete kitchen garden       |
| `GET`    | `/api/kg/:kgId/visits` | List visits for a garden    |
| `POST`   | `/api/kg/:kgId/visits` | Create visit                |
| `PUT`    | `/api/kg/visits/:id`   | Update visit                |
| `DELETE` | `/api/kg/visits/:id`   | Delete visit                |
| `GET`    | `/api/expenses`        | List all expenses           |
| `POST`   | `/api/expenses`        | Create expense              |
| `GET`    | `/api/expenses/:id`    | Get expense                 |
| `PUT`    | `/api/expenses/:id`    | Update expense              |
| `DELETE` | `/api/expenses/:id`    | Delete expense              |
| `GET`    | `/api/payments`        | List all payments           |
| `POST`   | `/api/payments`        | Create payment              |
| `GET`    | `/api/payments/:id`    | Get payment                 |
| `PUT`    | `/api/payments/:id`    | Update payment              |
| `DELETE` | `/api/payments/:id`    | Delete payment              |

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

Add the token to the `Authorization` header for all protected routes:

```bash
curl http://localhost:4000/api/customers \
  -H "Authorization: Bearer eyJhbGciOi..."
```

---

## Seeding the Database

The seed script creates sample data including:

- 1 admin user (`admin@freshroot.com` / `admin123`)
- 3 customers with addresses
- Subscriptions, orders, deliveries
- Kitchen garden setups with visits
- Expenses and payments

```bash
npm run seed
```

> **Note:** Run migrations first before seeding.

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

- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
