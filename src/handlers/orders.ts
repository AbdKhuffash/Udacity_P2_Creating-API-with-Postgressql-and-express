import { Router } from 'express';
import { OrderModel } from '../models/order';
import { verifyAuthToken } from '../middleware/auth';

export const ordersRouter = Router();
const orders = new OrderModel();

ordersRouter.use(verifyAuthToken);

ordersRouter.post('/', async (req, res) => {
  try {
    const o = await orders.create({
      user_id: Number(req.body.user_id),
      status: req.body.status
    });
    res.status(201).json(o);
  } catch (err) {
    console.error('POST /orders error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

ordersRouter.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const o = await orders.updateStatus(id, req.body.status);
    if (!o) return res.sendStatus(404);
    res.json(o);
  } catch (err) {
    console.error('PUT /orders/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

ordersRouter.delete('/:id', async (req, res) => {
  try {
    await orders.delete(Number(req.params.id));
    res.sendStatus(204);
  } catch (err) {
    console.error('DELETE /orders/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

ordersRouter.post('/:id/items', async (req, res) => {
  try {
    const item = await orders.addItem({
      order_id: Number(req.params.id),
      product_id: Number(req.body.product_id),
      quantity: Number(req.body.quantity)
    });
    res.status(201).json(item);
  } catch (err) {
    console.error('POST /orders/:id/items error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

ordersRouter.get('/user/:userId/current', async (req, res) => {
  try {
    const o = await orders.currentByUser(Number(req.params.userId));
    if (!o) return res.sendStatus(404);
    res.json(o);
  } catch (err) {
    console.error('GET /orders/user/:userId/current error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
