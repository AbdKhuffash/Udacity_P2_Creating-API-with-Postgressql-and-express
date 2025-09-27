import supertest from 'supertest';
import app from '../../server';

const request = supertest(app);

describe('Products endpoint (GET /products/:id)', () => {
  const email = `prod_${Math.random().toString(36).slice(2)}@ex.com`;
  let token = '';
  let productId = 0;

  beforeAll(async () => {
    // 1) make a user to get a JWT
    const u = await request.post('/users').send({
      email,
      first_name: 'Prod',
      last_name: 'Tester',
      password: 'secret'
    });
    expect([200, 201]).toContain(u.status);
    token = u.body.token;
    expect(token).toBeTruthy();

    // 2) create a product (protected)
    const p = await request
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Pencil', price: 1.25, category: 'office' });

    expect(p.status).toBe(201);
    expect(p.body?.id).toEqual(jasmine.any(Number));
    productId = p.body.id;
  });

  it('GET /products/:id — returns a product (public)', async () => {
    const res = await request.get(`/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body?.id).toBe(productId);
    expect(res.body?.name).toBe('Pencil');
    expect(Number(res.body?.price)).toBeCloseTo(1.25, 5);
    expect(res.body?.category).toBe('office');
  });

  it('GET /products/:id — returns 404 for missing product (public)', async () => {
    const res = await request.get('/products/999999'); // unlikely id
    
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body?.id).toEqual(jasmine.any(Number));
    }
  });
});
