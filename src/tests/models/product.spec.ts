import { ProductModel } from '../../models/product';

const model = new ProductModel();

describe('ProductModel (DB actions)', () => {
  let productId = 0;

  beforeAll(async () => {
    const p = await model.create({ name: 'Widget', price: 19.99, category: 'gadgets' });
    productId = p.id!;
  });

  it('create() inserted a product', async () => {
    const p = await model.show(productId);
    expect(p?.id).toBe(productId);
    expect(p?.name).toBe('Widget');
    expect(Number(p?.price)).toBeCloseTo(19.99, 2);
    expect(p?.category).toBe('gadgets');
  });

  it('show() returns a product by id', async () => {
    const p = await model.show(productId);
    expect(p?.id).toBe(productId);
  });

  it('index() returns a list including the created product', async () => {
    const list = await model.index();
    expect(Array.isArray(list)).toBeTrue();
    expect(list.some(p => p.id === productId)).toBeTrue();
  });

  it('byCategory() filters by category', async () => {
    const list = await model.byCategory('gadgets');
    expect(Array.isArray(list)).toBeTrue();
    expect(list.some(p => p.id === productId)).toBeTrue();
  });

  it('top5() returns up to five products (includes created one)', async () => {
    const list = await model.top5();
    expect(Array.isArray(list)).toBeTrue();
    expect(list.some(p => p.id === productId)).toBeTrue();
  });
});
