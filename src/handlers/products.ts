import { Router } from 'express';
import { ProductModel } from '../models/product';
import { verifyAuthToken } from '../middleware/auth';

export const productsRouter = Router();
const products = new ProductModel();

productsRouter.get('/', async (_req, res) => {
  try {
    res.json(await products.index());
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

productsRouter.get('/top', async (_req, res) => {
  try {
    res.json(await products.top5());
  } catch (err) {
    console.error('GET /products/top error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

productsRouter.get('/category/:category', async (req, res) => {
  try {
    res.json(await products.byCategory(req.params.category));
  } catch (err) {
    console.error('GET /products/category/:category error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

productsRouter.get('/:id', async (req, res) => {
  try {
    const p = await products.show(Number(req.params.id));
    if (!p) return res.sendStatus(404);
    res.json(p);
  } catch (err) {
    console.error('GET /products/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
    console.error('POST /products error:', err);
    if (err?.code === '23502' || err?.code === '23514') {
      return res.status(400).json({ error: 'Invalid product data' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});
