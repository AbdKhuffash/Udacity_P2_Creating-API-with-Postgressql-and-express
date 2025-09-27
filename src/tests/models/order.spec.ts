import { OrderModel } from '../../models/order';
import { ProductModel } from '../../models/product';
import { UserModel } from '../../models/user';
import { uniqueEmail } from '../helpers/utils';

const orders = new OrderModel();
const products = new ProductModel();
const users = new UserModel();

describe('OrderModel (DB actions)', () => {
  let userId = 0;
  let productId = 0;

  beforeAll(async () => {
    const { user } = await users.create({
      email: uniqueEmail('order'),
      first_name: 'Olivia',
      last_name: 'Order',
      password: 'pass'
    });
    userId = user.id!;
    const p = await products.create({ name: 'Mouse', price: 25, category: 'electronics' });
    productId = p.id!;
  });

  it('create() inserts an active order for the user', async () => {
    const o = await orders.create({ user_id: userId, status: 'active' });
    expect(typeof o.id).toBe('number');
    expect(o.user_id).toBe(userId);
    expect(o.status).toBe('active');
  });

  it('currentByUser() returns the latest active order', async () => {
    const created = await orders.create({ user_id: userId, status: 'active' });
    const current = await orders.currentByUser(userId);
    expect(current?.id).toBe(created.id);
    expect(current?.status).toBe('active');
  });

  it('addItem() adds a product to a given order', async () => {
    const created = await orders.create({ user_id: userId, status: 'active' });
    const item = await orders.addItem({
      order_id: created.id!,
      product_id: productId,
      quantity: 2
    });
    expect(item.order_id).toBe(created.id);
    expect(item.product_id).toBe(productId);
    expect(item.quantity).toBe(2);
  });

  it('updateStatus() sets the order to completed', async () => {
    const created = await orders.create({ user_id: userId, status: 'active' });
    const updated = await orders.updateStatus(created.id!, 'completed');
    expect(updated?.id).toBe(created.id);
    expect(updated?.status).toBe('completed');
  });

  it('completedByUser() lists completed orders for the user', async () => {
    const created = await orders.create({ user_id: userId, status: 'active' });
    await orders.updateStatus(created.id!, 'completed');
    const list = await orders.completedByUser(userId);
    expect(Array.isArray(list)).toBeTrue();
    expect(list.some(o => o.id === created.id)).toBeTrue();
  });

  it('delete() removes an order', async () => {
    const created = await orders.create({ user_id: userId, status: 'active' });
    await orders.delete(created.id!);
    const after = await orders.updateStatus(created.id!, 'completed');
    expect(after).toBeNull(); // cannot update a deleted order
  });
});
