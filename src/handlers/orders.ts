import { Router } from 'express';
import { OrderModel } from '../models/order';
import { verifyAuthToken } from '../middleware/auth';

export const ordersRouter = Router();
const orders = new OrderModel();

ordersRouter.use(verifyAuthToken);

// src/handlers/orders.ts  (your router file)
ordersRouter.post('/', async (req, res) => {
  const o = await orders.create({
    user_id: Number(req.body.user_id),
    status: req.body.status
  });
  res.status(201).json(o);
});

ordersRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const o = await orders.updateStatus(id, req.body.status);
  if (!o) return res.sendStatus(404);
  res.json(o);
});

ordersRouter.delete('/:id', async (req, res) => {
  await orders.delete(Number(req.params.id));
  res.sendStatus(204);
});

ordersRouter.post('/:id/items', async (req, res) => {
  const item = await orders.addItem({
    order_id: Number(req.params.id),
    product_id: Number(req.body.product_id),
    quantity: Number(req.body.quantity)
  });
  res.status(201).json(item);
});

ordersRouter.get('/user/:userId/current', async (req, res) => {
  const o = await orders.currentByUser(Number(req.params.userId));
  if (!o) return res.sendStatus(404);
  res.json(o);
});
