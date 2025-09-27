import { Router } from 'express';
import { ProductModel } from '../models/product';
import { verifyAuthToken } from '../middleware/auth';

export const productsRouter = Router();
const products = new ProductModel();

productsRouter.get('/', async (_req, res) => res.json(await products.index()));
productsRouter.get('/top', async (_req, res) => res.json(await products.top5())); // optional
productsRouter.get('/category/:category', async (req, res) => res.json(await products.byCategory(req.params.category))); // optional

productsRouter.get('/:id', async (req, res) => {
  const p = await products.show(Number(req.params.id));
  if (!p) return res.sendStatus(404);
  res.json(p);
});

// src/handlers/products.ts (POST /products)
productsRouter.post('/', verifyAuthToken, async (req, res) => {
  try {
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Content-Type must be application/json' });
    }
    const { name, price, category } = req.body || {};
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required (string)' });
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: 'price must be a non-negative number' });
    }
    const created = await products.create({ name: name.trim(), price: priceNum, category });
    res.status(201).json(created);
  } catch (err: any) {
    console.error('Create product failed:', err);
    if (err?.code === '23502' || err?.code === '23514') {
      return res.status(400).json({ error: 'Invalid product data' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

