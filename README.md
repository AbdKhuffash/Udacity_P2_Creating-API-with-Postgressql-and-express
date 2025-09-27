# UDACITY_P2_STOREFRONT_BACKEND_API

![Last Commit](https://img.shields.io/github/last-commit/AbdKhuffash/Udacity_P2_Creating-API-with-Postgressql-and-express?color=blue&label=last%20commit)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Languages](https://img.shields.io/badge/languages-TS%2C%20SQL%2C%20JSON-brightgreen)

---

## 🚀 Built with the tools and technologies:

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-black?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![db-migrate](https://img.shields.io/badge/db--migrate-000000)
![bcrypt](https://img.shields.io/badge/bcrypt-grey)
![JWT](https://img.shields.io/badge/JWT-black)
![dotenv](https://img.shields.io/badge/.ENV-ECD53F?logo=dotenv&logoColor=black)
![Yarn](https://img.shields.io/badge/Yarn-2C8EBB?logo=yarn&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Jasmine](https://img.shields.io/badge/Jasmine-8A4182?logo=jasmine&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

---

## 📑 Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install & Setup](#install-setup)
  - [Environment Variables](#environmnet-variable)
  - [Database (Docker)](#database-docker)
  - [Migrations](#migration)
  - [Run the Server](#run-the-server)
  - [Testing](#testing)
- [API Usage](#api-usage)
- [Authentication & Headers](#authentication-headers)
- [Troubleshooting](#troubleshooting)

---

## 📖 Overview

**Storefront Backend API** — A REST API for a simple e-commerce storefront.

Features:
- 🛍️ **Products**: list, show, and create (protected).
- 👤 **Users**: register (returns JWT), login (returns JWT), list/show (protected).
- 🧾 **Orders**: create/update/delete orders, add items, and get current/completed orders per user (protected).
- 🗄️ **PostgreSQL** + **db-migrate** migrations.
- 🧪 **Jasmine** tests for models and endpoints.

Defaults:
- API base URL: `http://localhost:3000`
- Postgres (via Docker): host port **5433** mapped to container **5432**

---

## 🚀 Getting Started

### ✅ Prerequisites
- **Node.js** 18+ (or 20+)
- **Yarn** (or npm)
- **Docker** & **Docker Compose**

---

### ⚙️ Install & Setup
```bash
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME
yarn install
```

---

### 🔐 Environment Variables
Create a `.env` at project root (this file is gitignored). Example:

```
PORT=3000
ENV=dev
NODE_ENV=development

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

> Ensure `POSTGRES_PASSWORD` matches the one in `docker-compose.yml`.

---

### 🗄️ Database (Docker)
Start Postgres:
```bash
docker compose up -d
```

Create the **test** database once (inside the container):
```bash
# Find the running Postgres container name
docker ps

# Create the test DB
docker exec -it <pg-container> psql -U postgres -d postgres -c "CREATE DATABASE shopping_test;"
```

**database.json** (used by db-migrate):
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

---

### 🧱 Migrations
Dev DB:
```bash
yarn migrate:up
```

Test DB:
```bash
yarn migrate:test:reset && yarn migrate:test:up
```

---

### ▶️ Run the Server
**Option A: Watch (auto-compile & run)**
```bash
yarn watch
```

**Option B: Build then run**
```bash
yarn build
node dist/server.js
```

Server URL: `http://localhost:3000`

---

### 🧪 Testing
Full clean cycle:
```bash
yarn test:clean && yarn test
```

Just the tests (if DB prepared):
```bash
yarn test
```

---

## 🌐 API Usage

### Users
- **Register**
  ```
  POST /users
  Content-Type: application/json

  {
    "email": "john@ex.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "secret"
  }
  ```
  Response: `201 Created` → `{ user: { id, email, first_name, last_name }, token }`

- **Login**
  ```
  POST /users/auth
  Content-Type: application/json

  { "email": "john@ex.com", "password": "secret" }
  ```
  Response: `200 OK` → `{ token }`

- **List** (JWT)
  ```
  GET /users
  Authorization: Bearer <token>
  ```

- **Show** (JWT)
  ```
  GET /users/:id
  Authorization: Bearer <token>
  ```

---

### Products
- **Create** (JWT)
  ```
  POST /products
  Authorization: Bearer <token>
  Content-Type: application/json

  { "name": "Mouse", "price": 25, "category": "electronics" }
  ```
  Response: `201 Created`

- **Index**
  ```
  GET /products
  ```

- **Show**
  ```
  GET /products/:id
  ```

- **Top 5 (optional)**
  ```
  GET /products/top
  ```

- **By Category (optional)**
  ```
  GET /products/category/:category
  ```

---

### Orders (JWT)
- **Create**
  ```
  POST /orders
  Authorization: Bearer <token>
  Content-Type: application/json

  { "user_id": 1, "status": "active" }
  ```

- **Update status**
  ```
  PUT /orders/:id
  Authorization: Bearer <token>
  Content-Type: application/json

  { "status": "completed" }
  ```

- **Delete**
  ```
  DELETE /orders/:id
  Authorization: Bearer <token>
  ```

- **Add item**
  ```
  POST /orders/:id/items
  Authorization: Bearer <token>
  Content-Type: application/json

  { "product_id": 3, "quantity": 2 }
  ```

- **Current order for user**
  ```
  GET /orders/user/:userId/current
  Authorization: Bearer <token>
  ```

- **Completed orders for user (optional)**
  ```
  GET /orders/user/:userId/completed
  Authorization: Bearer <token>
  ```

---

## 🔑 Authentication & Headers
Protected endpoints require:
```
Authorization: Bearer <JWT>
```
- Tokens are returned by `POST /users` and `POST /users/auth`.
- Passwords are hashed via `bcrypt` using `SALT_ROUNDS` and `BCRYPT_PEPPER`.

---

## 🔧 Troubleshooting
- **“relation X does not exist”**
  - Run migrations for the correct env:
    - Dev: `yarn migrate:up`
    - Test: `yarn migrate:test:reset && yarn migrate:test:up`

- **“password authentication failed”**
  - Ensure `.env` DB password matches `docker-compose.yml`.

- **“database shopping_test does not exist”**
  - Create it inside the container (see DB section).

- **401 Unauthorized on protected routes**
  - Include `Authorization: Bearer <token>` from /users or /users/auth.

- **Port conflicts**
  - If `5433` is taken, change Docker mapping (e.g., `5434:5432`) and update `.env` & `database.json`.

---

## 🔙 Return
[Back to Top](#udacity_p2_storefront_backend_api)


