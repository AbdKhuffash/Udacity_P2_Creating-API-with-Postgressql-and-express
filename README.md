Storefront Backend API — README
================================

This project is a Node/Express API with PostgreSQL that powers a simple storefront.
It uses TypeScript, db-migrate, bcrypt, and JWT for auth.




## Tech Stack

- Node.js + Express
- TypeScript
- PostgreSQL 15 (via Docker)
- db-migrate (migrations)
- jsonwebtoken (JWT)
- bcrypt (password hashing)
- jasmine (tests)
- dotenv (env vars)


## Ports

- **API**: `http://localhost:3000`
- **PostgreSQL (host)**: `localhost:5433` → (mapped to container `5432`)


## Quick Start

```bash
# 1) Install dependencies
yarn install

# 2) Start Postgres with Docker
docker compose up -d

# 3) Create & migrate databases
# Dev:
yarn migrate:up

# Test (recreates and migrates test DB):
yarn test:clean

# 4) Start the API (dev)
yarn watch
# or run compiled server (if using JavaScript build):
# node dist/server.js

# 5) Run tests
yarn test
```


## Environment Variables

Create a `.env` file at the project root. **Do not commit it** (see `.gitignore`).

Example:
```
PORT=3000
ENV=dev

POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5433
POSTGRES_DB=shopping_dev
POSTGRES_TEST_DB=shopping_test
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

BCRYPT_PEPPER=superSecretPepper
SALT_ROUNDS=10
JWT_SECRET=superSecretJwt
CORS_ORIGIN=*
```

> **Important**: Make sure `POSTGRES_PASSWORD` matches the password in `docker-compose.yml`.  
> This template uses `postgres`. If you change one, change both.


## Database & Migrations

Postgres runs in Docker using `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:15
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: shopping_dev
    volumes:
      - "postgres:/var/lib/postgresql/data"
volumes:
  postgres:
```

### Migrations commands

- Dev up: `yarn migrate:up`
- Dev down: `yarn migrate:down`
- Test reset+up+build: `yarn test:clean`
- Run tests: `yarn test`

`database.json` is configured for db-migrate:

```json
{
  "dev": {
    "driver": "pg",
    "host": "127.0.0.1",
    "port": 5433,
    "database": "shopping_dev",
    "user": "postgres",
    "password": "postgres"
  },
  "test": {
    "driver": "pg",
    "host": "127.0.0.1",
    "port": 5433,
    "database": "shopping_test",
    "user": "postgres",
    "password": "postgres"
  }
}
```

### Using psql inside the container (no local psql needed)

```bash
# List databases
docker exec -it <container_name> psql -U postgres -d postgres -c "\l"

# Connect to test DB
docker exec -it <container_name> psql -U postgres -d shopping_test

# List tables in test DB
docker exec -it <container_name> psql -U postgres -d shopping_test -c "\dt"
```

Where `<container_name>` looks like `nd0067-c2-creating-an-api-with-postgresql-and-express-project-starter-postgres-1` (use `docker ps`).


## API Overview

Authentication uses JWT. Registering a user returns a token. Some routes require the `Authorization: Bearer <token>` header.

- **Users**
  - `POST /users` — Register user (returns `{ user, token }`)
  - `POST /users/auth` — Login (returns `{ token }`)
  - `GET /users` — List users (**token required**)
  - `GET /users/:id` — Show user (**token required**)

- **Products**
  - `GET /products` — List products
  - `GET /products/:id` — Show product
  - `POST /products` — Create product (**token required**)
  - `GET /products/top` — Top 5 popular (optional)
  - `GET /products/category/:category` — Filter by category (optional)

- **Orders** (all **token required**)
  - `POST /orders` — Create order
  - `PUT /orders/:id` — Update status
  - `DELETE /orders/:id` — Delete order
  - `POST /orders/:id/items` — Add product to order
  - `GET /orders/user/:userId/current` — Current active order by user
  - `GET /orders/user/:userId/completed` — (optional) Completed orders by user


## Data Shapes (TypeScript)

```ts
// src/models/user.ts
export type User = {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
};

// src/models/product.ts
export type Product = {
  id?: number;
  name: string;
  price: number;
  category?: string;
};

// src/models/order.ts
export type Order = {
  id?: number;
  user_id: number;
  status: 'active' | 'completed';
};

export type OrderItem = {
  id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
};
```

## Database Schema (tables)

- **users**
  - `id SERIAL PRIMARY KEY`
  - `email VARCHAR(255) UNIQUE NOT NULL`
  - `first_name VARCHAR(100) NOT NULL`
  - `last_name VARCHAR(100) NOT NULL`
  - `password_digest VARCHAR(255) NOT NULL`
  - `created_at TIMESTAMP DEFAULT NOW()`
  - `updated_at TIMESTAMP DEFAULT NOW()`

- **products**
  - `id SERIAL PRIMARY KEY`
  - `name VARCHAR(255) NOT NULL`
  - `price NUMERIC(10,2) NOT NULL CHECK (price >= 0)`
  - `category VARCHAR(100)`
  - `created_at TIMESTAMP DEFAULT NOW()`
  - `updated_at TIMESTAMP DEFAULT NOW()`

- **orders**
  - `id SERIAL PRIMARY KEY`
  - `user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE`
  - `status VARCHAR(20) NOT NULL CHECK (status IN ('active','completed'))`
  - `created_at TIMESTAMP DEFAULT NOW()`
  - `updated_at TIMESTAMP DEFAULT NOW()`

- **order_items**
  - `id SERIAL PRIMARY KEY`
  - `order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE`
  - `product_id INT NOT NULL REFERENCES products(id)`
  - `quantity INT NOT NULL CHECK (quantity > 0)`
  - `UNIQUE (order_id, product_id)`


## Running the API

```bash
yarn watch          # dev mode (tsc-watch -> dist -> node)
# or
yarn build && node dist/server.js
```

API will start at `http://localhost:3000`.


## Authentication

- Register: `POST /users` → returns `{ user, token }`
- Login: `POST /users/auth` → returns `{ token }`
- For protected endpoints, include header:
  - `Authorization: Bearer <token>`


## Troubleshooting

- **Port in use (5433)**: Change the host port in `docker-compose.yml` (e.g., `5434:5432`) and in `.env` & `database.json`.
- **"database ... does not exist"**: Ensure you ran migrations. For test DB: `yarn test:clean`. For dev DB: `yarn migrate:up`.
- **"password authentication failed"**: Ensure `POSTGRES_PASSWORD` in `.env` and `database.json` matches `docker-compose.yml`.
- **No `psql` locally**: Use `docker exec` examples above.
- **JWT 401s in tests**: Make sure tests register or login first and pass `Authorization: Bearer <token>` header.

---

© 2025 Storefront Backend API
