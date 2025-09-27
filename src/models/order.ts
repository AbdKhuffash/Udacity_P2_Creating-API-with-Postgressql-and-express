import { client } from '../database';
import { PoolClient } from 'pg';

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
    let c: PoolClient | undefined;
    try {
      c = await client.connect();
      const r = await c.query(
        'INSERT INTO orders(user_id, status) VALUES($1,$2) RETURNING *',
        [o.user_id, o.status]
      );
      return r.rows[0];
    } catch (err) {
      console.error('OrderModel.create error:', err);
      throw err;
    } finally {
      c?.release();
    }
  }

  async updateStatus(id: number, status: Order['status']) {
    let c: PoolClient | undefined;
    try {
      c = await client.connect();
      const r = await c.query(
        'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
        [status, id]
      );
      return r.rows[0] || null;
    } catch (err) {
      console.error('OrderModel.updateStatus error:', err);
      throw err;
    } finally {
      c?.release();
    }
  }

  async delete(id: number) {
    let c: PoolClient | undefined;
    try {
      c = await client.connect();
      await c.query('DELETE FROM orders WHERE id=$1', [id]);
    } catch (err) {
      console.error('OrderModel.delete error:', err);
      throw err;
    } finally {
      c?.release();
    }
  }

  async addItem(i: OrderItem) {
    let c: PoolClient | undefined;
    try {
      c = await client.connect();
      const r = await c.query(
        'INSERT INTO order_items(order_id, product_id, quantity) VALUES($1,$2,$3) RETURNING *',
        [i.order_id, i.product_id, i.quantity]
      );
      return r.rows[0];
    } catch (err) {
      console.error('OrderModel.addItem error:', err);
      throw err;
    } finally {
      c?.release();
    }
  }

  async currentByUser(user_id: number) {
    let c: PoolClient | undefined;
    try {
      c = await client.connect();
      const r = await c.query(
        'SELECT * FROM orders WHERE user_id=$1 AND status=$2 ORDER BY id DESC LIMIT 1',
        [user_id, 'active']
      );
      return r.rows[0] || null;
    } catch (err) {
      console.error('OrderModel.currentByUser error:', err);
      throw err;
    } finally {
      c?.release();
    }
  }

  async completedByUser(user_id: number) {
    let c: PoolClient | undefined;
    try {
      c = await client.connect();
      const r = await c.query(
        'SELECT * FROM orders WHERE user_id=$1 AND status=$2 ORDER BY id DESC',
        [user_id, 'completed']
      );
      return r.rows;
    } catch (err) {
      console.error('OrderModel.completedByUser error:', err);
      throw err;
    } finally {
      c?.release();
    }
  }
}
