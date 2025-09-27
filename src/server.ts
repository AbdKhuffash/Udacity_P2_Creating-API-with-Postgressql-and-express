// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// route handlers
import { usersRouter } from './handlers/users';
import { productsRouter } from './handlers/products';
import { ordersRouter } from './handlers/orders';

dotenv.config();

const app = express();

// middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json()); // replaces body-parser

// health/root
app.get('/', (_req, res) => res.send('Shopping API is up'));

// mount routers
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`starting app on: 0.0.0.0:${port}`));

export default app; // needed for supertest in jasmine
