import supertest from 'supertest';
import app from '../../server';
import { uniqueEmail } from '../helpers/utils';

const request = supertest(app);

describe('API (users & products endpoints)', () => {
  let token = '';
  let createdProductId = 0;

  beforeAll(async () => {
    // get a token
    const u = await request.post('/users').send({
      email: uniqueEmail('user'),
      first_name: 'A',
      last_name: 'B',
      password: 'secret'
    });
    expect(u.status).toBe(201);
    token = u.body.token;

    // create a seed product so GET /products always has at least one row
    const p = await request
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'SeedProd', price: 5.55 });
    expect(p.status).toBe(201);
    createdProductId = p.body.id;
  });

  it('POST /users — registers and returns a token', async () => {
    const res = await request.post('/users').send({
      email: uniqueEmail('user2'),
      first_name: 'C',
      last_name: 'D',
      password: 'secret'
    });
    expect(res.status).toBe(201);
    expect(res.body?.token).toBeTruthy();
  });

  it('POST /products — creates a product (protected)', async () => {
    const res = await request
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Book', price: 9.99 });

    expect(res.status).toBe(201);
    expect(res.body?.name).toBe('Book');
  });

  it('GET /products — lists products (public)', async () => {
    const res = await request.get('/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTrue();
    expect(res.body.some((p: any) => p.id === createdProductId)).toBeTrue();
  });
});
