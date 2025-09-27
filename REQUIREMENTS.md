# Storefront Backend – Requirements

This document maps the API endpoints to RESTful routes/verbs and defines the database schema and data shapes used by the application.

---

## ✅ API Endpoints (RESTful Routes)

### Products
| Purpose                         | Method | Route                          | Auth |
|---------------------------------|--------|--------------------------------|------|
| Index (list all)                | GET    | `/products`                    | No   |
| Show (by id)                    | GET    | `/products/:id`                | No   |
| Create                          | POST   | `/products`                    | Yes  |
| Top 5 most popular *(optional)* | GET    | `/products/top`                | No   |
| By category *(optional)*        | GET    | `/products/category/:category` | No   |

### Users
| Purpose              | Method | Route         | Auth | Notes                     |
|----------------------|--------|---------------|------|---------------------------|
| Register (create)    | POST   | `/users`      | No   | Returns `{ user, token }` |
| Login (authenticate) | POST   | `/users/auth` | No   | Returns `{ token }`       |
| Index (list)         | GET    | `/users`      | Yes  | Bearer token required     |
| Show (by id)         | GET    | `/users/:id`  | Yes  | Bearer token required     |

### Orders
| Purpose                              | Method | Route                           | Auth |
|--------------------------------------|--------|---------------------------------|------|
| Create order                         | POST   | `/orders`                       | Yes  |
| Update order status                  | PUT    | `/orders/:id`                   | Yes  |
| Delete order                         | DELETE | `/orders/:id`                   | Yes  |
| Add item to order                    | POST   | `/orders/:id/items`             | Yes  |
| Current order by user                | GET    | `/orders/user/:userId/current`  | Yes  |
| Completed orders by user *(optional)*| GET    | `/orders/user/:userId/completed`| Yes  |

**Auth header for protected routes**
```
Authorization: Bearer <JWT>
```

---

## 🧩 Data Shapes (TypeScript-style)

```ts
// Product
export type Product = {
  id?: number;
  name: string;
  price: number;
  category?: string;
};

// User (plain password only on input; DB stores password_digest)
export type User = {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
};

// Order
export type Order = {
  id?: number;
  user_id: number;
  status: 'active' | 'completed';
};

// OrderItem
export type OrderItem = {
  id?: number;
  order_id: number;   // FK → orders.id
  product_id: number; // FK → products.id
  quantity: number;   // > 0
};
```

---

## 🗄️ Database Schema (PostgreSQL)

### Tables & Columns

**users**
- `id`               SERIAL PRIMARY KEY  
- `email`            VARCHAR(255) UNIQUE NOT NULL  
- `first_name`       VARCHAR(100) NOT NULL  
- `last_name`        VARCHAR(100) NOT NULL  
- `password_digest`  VARCHAR(255) NOT NULL  
- `created_at`       TIMESTAMP DEFAULT NOW()  
- `updated_at`       TIMESTAMP DEFAULT NOW()  

**products**
- `id`         SERIAL PRIMARY KEY  
- `name`       VARCHAR(255) NOT NULL  
- `price`      NUMERIC(10,2) NOT NULL CHECK (price >= 0)  
- `category`   VARCHAR(100)  
- `created_at` TIMESTAMP DEFAULT NOW()  
- `updated_at` TIMESTAMP DEFAULT NOW()  

**orders**
- `id`         SERIAL PRIMARY KEY  
- `user_id`    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE  
- `status`     VARCHAR(20) NOT NULL CHECK (status IN ('active','completed'))  
- `created_at` TIMESTAMP DEFAULT NOW()  
- `updated_at` TIMESTAMP DEFAULT NOW()  

**order_items**
- `id`          SERIAL PRIMARY KEY  
- `order_id`    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE  
- `product_id`  INT NOT NULL REFERENCES products(id)  
- `quantity`    INT NOT NULL CHECK (quantity > 0)  
- `UNIQUE(order_id, product_id)`  

### Relationships
- users **1 ──<** orders  
- orders **1 ──<** order_items  
- products **1 ──<** order_items  
- Many-to-many between orders and products via order_items

---

## 🧱 Migrations

Each table has a matching **up** and **down** migration.
- **Up**: creates tables, constraints, and indexes in dependency order.
- **Down**: drops in reverse order (`order_items` → `products`/`orders` → `users`).

Running:
```bash
db-migrate up                 # dev
db-migrate --env test up      # test
```
creates the schema for the selected environment.

---

## 🔐 Authentication & Security

- Passwords are hashed with **bcrypt** using:
  - `SALT_ROUNDS`
  - `BCRYPT_PEPPER`
- **JWT** tokens:
  - Returned by `POST /users` (register) and `POST /users/auth` (login)
  - Verified by middleware on protected endpoints
  - Signed using `JWT_SECRET`

---

## 🌍 Environment / Ports

- **Backend (Express)**: `PORT=3000` → `http://localhost:3000`  
- **Database (Postgres via Docker)**: Host `127.0.0.1`, Port `5433` (container 5432)

**Required `.env` variables**  
`PORT, ENV, NODE_ENV, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_TEST_DB, POSTGRES_USER, POSTGRES_PASSWORD, BCRYPT_PEPPER, SALT_ROUNDS, JWT_SECRET, CORS_ORIGIN`

---

## 🧪 Testing Expectations

- Endpoint tests cover all required routes (protected routes use Bearer token).
- Model tests cover all DB actions (CRUD and query helpers).
- Tests run against the **test** DB (`shopping_test`) and reset/migrate before execution.

**Scripts:**
```bash
yarn test:clean && yarn test
# or
yarn test
```

---

## 🧾 SQL Expectations (per rubric)

- **SELECT**: list/show resources and joins (e.g., top 5 by quantity sold).  
- **INSERT / UPDATE / DELETE**: create users/products/orders, update order status, add items, delete orders.  
- **WHERE** clauses: find by `id`, `user_id`, category, and status (`active` vs `completed`).  
