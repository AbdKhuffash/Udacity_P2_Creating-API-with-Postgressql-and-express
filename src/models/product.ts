import { client } from '../database';

export type Product = {
  id?: number;
  name: string;
  price: number;
  category?: string;
};

export class ProductModel {
  async index() {
    const c = await client.connect();
    const r = await c.query('SELECT * FROM products ORDER BY id');
    c.release();
    return r.rows;
  }

  async show(id: number) {
    const c = await client.connect();
    const r = await c.query('SELECT * FROM products WHERE id=$1', [id]);
    c.release();
    return r.rows[0] || null;
  }

  async create(p: Product) {
    const c = await client.connect();
    const r = await c.query(
      'INSERT INTO products(name, price, category) VALUES($1,$2,$3) RETURNING *',
      [p.name, p.price, p.category ?? null]
    );
    c.release();
    return r.rows[0];
  }

  // OPTIONAL: top 5 popular (by quantity sold)
  async top5() {
    const c = await client.connect();
    const r = await c.query(
      `SELECT p.*, COALESCE(SUM(oi.quantity),0) AS sold
       FROM products p
       LEFT JOIN order_items oi ON oi.product_id = p.id
       GROUP BY p.id
       ORDER BY sold DESC
       LIMIT 5`
    );
    c.release();
    return r.rows;
  }

  // OPTIONAL: products by category
  async byCategory(cat: string) {
    const c = await client.connect();
    const r = await c.query('SELECT * FROM products WHERE category=$1', [cat]);
    c.release();
    return r.rows;
  }
}
