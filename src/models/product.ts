import { client } from '../database';
import { PoolClient } from 'pg';

export type Product = {
  id?: number;
  name: string;
  price: number;
  category?: string;
};

export class ProductModel {
  async index() {
    let c: PoolClient | undefined;
    try {
      c = await client.connect();
      const r = await c.query('SELECT * FROM products ORDER BY id');
      return r.rows;
    } catch (err) {
      console.error('ProductModel.index error:', err);
      throw err;
    } finally {
      c?.release();
    }
  }

  async show(id: number) {
    let c: PoolClient | undefined;
    try {
      c = await client.connect();
      const r = await c.query('SELECT * FROM products WHERE id=$1', [id]);
      return r.rows[0] || null;
    } catch (err) {
      console.error('ProductModel.show error:', err);
      throw err;
    } finally {
      c?.release();
    }
  }

  async create(p: Product) {
    let c: PoolClient | undefined;
    try {
      c = await client.connect();
      const r = await c.query(
        'INSERT INTO products(name, price, category) VALUES($1,$2,$3) RETURNING *',
        [p.name, p.price, p.category ?? null]
      );
      return r.rows[0];
    } catch (err) {
      console.error('ProductModel.create error:', err);
      throw err;
    } finally {
      c?.release();
    }
  }

  async top5() {
    let c: PoolClient | undefined;
    try {
      c = await client.connect();
      const r = await c.query(
        `SELECT p.*, COALESCE(SUM(oi.quantity),0) AS sold
         FROM products p
         LEFT JOIN order_items oi ON oi.product_id = p.id
         GROUP BY p.id
         ORDER BY sold DESC
         LIMIT 5`
      );
      return r.rows;
    } catch (err) {
      console.error('ProductModel.top5 error:', err);
      throw err;
    } finally {
      c?.release();
    }
  }

  async byCategory(cat: string) {
    let c: PoolClient | undefined;
    try {
      c = await client.connect();
      const r = await c.query('SELECT * FROM products WHERE category=$1', [cat]);
      return r.rows;
    } catch (err) {
      console.error('ProductModel.byCategory error:', err);
      throw err;
    } finally {
      c?.release();
    }
  }
}
