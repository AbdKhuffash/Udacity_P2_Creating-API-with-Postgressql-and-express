import { UserModel } from '../../models/user';
import { uniqueEmail } from '../helpers/utils';

const model = new UserModel();

describe('UserModel (DB actions)', () => {
  const email = uniqueEmail('user');
  let createdId = 0;

  beforeAll(async () => {
    const { user } = await model.create({
      email,
      first_name: 'Test',
      last_name: 'User',
      password: 'pass123'
    });
    createdId = user.id!;
  });

  it('create() returned a persisted user id', async () => {
    expect(typeof createdId).toBe('number');
    expect(createdId).toBeGreaterThan(0);
  });

  it('authenticate() returns a JWT for valid credentials', async () => {
    const token = await model.authenticate(email, 'pass123');
    expect(token).toBeTruthy();
  });

  it('authenticate() returns null for bad credentials', async () => {
    const token = await model.authenticate(email, 'wrong');
    expect(token).toBeNull();
  });

  it('show() returns the user by id', async () => {
    const user = await model.show(createdId);
    expect(user?.id).toBe(createdId);
    expect(user?.email).toBe(email);
  });

  it('index() returns an array including the created user', async () => {
    const users = await model.index();
    expect(Array.isArray(users)).toBeTrue();
    expect(users.some(u => u.id === createdId)).toBeTrue();
  });
});
