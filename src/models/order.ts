import { client } from '../database';

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

export class OrderModel {
  async create(o: Order) {
    const c = await client.connect();
    const r = await c.query(
      'INSERT INTO orders(user_id, status) VALUES($1,$2) RETURNING *',
      [o.user_id, o.status]
    );
    c.release();
    return r.rows[0];
  }

  async updateStatus(id: number, status: Order['status']) {
    const c = await client.connect();
    const r = await c.query(
      'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, id]
    );
    c.release();
    return r.rows[0] || null;
  }

  async delete(id: number) {
    const c = await client.connect();
    await c.query('DELETE FROM orders WHERE id=$1', [id]);
    c.release();
  }

  async addItem(i: OrderItem) {
    const c = await client.connect();
    const r = await c.query(
      'INSERT INTO order_items(order_id, product_id, quantity) VALUES($1,$2,$3) RETURNING *',
      [i.order_id, i.product_id, i.quantity]
    );
    c.release();
    return r.rows[0];
  }

async currentByUser(user_id: number) {
  const c = await client.connect();
  const r = await c.query(
    'SELECT * FROM orders WHERE user_id=$1 AND status=$2 ORDER BY id DESC LIMIT 1',
    [user_id, 'active']
  );
  c.release();
  return r.rows[0] || null;
}

async completedByUser(user_id: number) {
  const c = await client.connect();
  const r = await c.query(
    'SELECT * FROM orders WHERE user_id=$1 AND status=$2 ORDER BY id DESC',
    [user_id, 'completed']
  );
  c.release();
  return r.rows;
}
}
