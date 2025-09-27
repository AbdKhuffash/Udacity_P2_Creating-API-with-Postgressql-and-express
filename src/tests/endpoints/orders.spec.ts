import supertest from 'supertest';
import app from '../../server';
import { uniqueEmail } from '../helpers/utils';

const req = supertest(app);

describe('Orders endpoints', () => {
  let token = '';
  let userId = 0;
  let productId = 0;

  beforeAll(async () => {
    // token + user
    const r = await req.post('/users').send({
      email: uniqueEmail('order'),
      first_name: 'O',
      last_name: 'K',
      password: 'pass'
    });
    expect(r.status).toBe(201);
    token = r.body.token;
    userId = r.body.user.id;

    // product to add to orders
    const p = await req
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Mouse', price: 25, category: 'electronics' });
    expect(p.status).toBe(201);
    productId = p.body.id;
  });

  it('POST /orders — creates order (protected)', async () => {
    const r = await req
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: userId, status: 'active' });
    expect(r.status).toBe(201);
    expect(typeof r.body.id).toBe('number');
  });

  it('POST /orders/:id/items — adds item (protected)', async () => {
    // fresh order for this spec
    const ord = await req
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: userId, status: 'active' });
    const orderId = ord.body.id as number;

    const r = await req
      .post(`/orders/${orderId}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 2 });

    expect(r.status).toBe(201);
    expect(r.body.order_id).toBe(orderId);
    expect(r.body.product_id).toBe(productId);
    expect(r.body.quantity).toBe(2);
  });

  it('GET /orders/user/:userId/current — gets current order (protected)', async () => {
    // make sure there is an active order "latest"
    await req
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: userId, status: 'active' });

    const r = await req
      .get(`/orders/user/${userId}/current`)
      .set('Authorization', `Bearer ${token}`);

    expect(r.status).toBe(200);
    expect(r.body.user_id).toBe(userId);
    expect(r.body.status).toBe('active');
  });

  it('PUT /orders/:id — completes order (protected)', async () => {
    // create then complete
    const created = await req
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: userId, status: 'active' });
    const orderId = created.body.id;

    const r = await req
      .put(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(r.status).toBe(200);
    expect(r.body.status).toBe('completed');
  });

  it('DELETE /orders/:id — deletes order (protected)', async () => {
    const created = await req
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: userId, status: 'active' });
    const orderId = created.body.id;

    const r = await req
      .delete(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(r.status).toBe(204);
  });
});
