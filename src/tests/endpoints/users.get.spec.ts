import supertest from 'supertest';
import app from '../../server';

const request = supertest(app);

describe('Users endpoints (GET)', () => {
  const email = `user_${Math.random().toString(36).slice(2)}@ex.com`;
  let token = '';
  let userId = 0;

  beforeAll(async () => {
    // register a user and capture token + id
    const res = await request.post('/users').send({
      email,
      first_name: 'Test',
      last_name: 'User',
      password: 'pass123'
    });
    expect([200, 201]).toContain(res.status);
    expect(res.body?.token).toBeTruthy();
    token = res.body.token;
    userId = res.body?.user?.id ?? 0;
    expect(userId).toBeGreaterThan(0);
  });

  it('GET /users — lists users (protected)', async () => {
    const res = await request
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTrue();
    // contains the user we just created
    expect(res.body.some((u: any) => u.id === userId)).toBeTrue();
  });

  it('GET /users/:id — shows user by id (protected)', async () => {
    const res = await request
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body?.id).toBe(userId);
    expect(res.body?.email).toBe(email);
  });
});
