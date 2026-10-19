const { test, expect, api, customer } = require('../../src/fixtures');

test.describe('API contracts', () => {
  test('login rejects a bad password @smoke', async ({ request }) => {
    const response = await api.login(request, customer.email, 'not-the-password');
    expect(response.status()).toBe(401);
  });

  test('GET /users/me matches the customer used to log in @smoke', async ({
    request,
    customerToken,
  }) => {
    const response = await api.me(request, customerToken);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.email).toBe(customer.email);
    expect(body.role ?? 'user').not.toBe('admin');
  });

  test('product detail matches the list payload', async ({ request, inStockProduct }) => {
    const detail = await api.productById(request, inStockProduct.id);
    expect(detail.id).toBe(inStockProduct.id);
    expect(detail.name).toBe(inStockProduct.name);
    expect(detail.price).toBe(inStockProduct.price);
    expect(detail.in_stock).toBe(true);
  });

  test('GET /brands returns the two Toolshop brands @smoke', async ({ request }) => {
    const brandList = await api.brands(request);
    const names = brandList.map((brand) => brand.name).sort();
    expect(names).toEqual(['ForgeFlex Tools', 'MightyCraft Hardware']);
  });

  test('GET /categories/tree has Hand Tools, Power Tools, and Other', async ({ request }) => {
    const tree = await api.categoriesTree(request);
    const names = tree.map((node) => node.name);
    expect(names).toEqual(expect.arrayContaining(['Hand Tools', 'Power Tools', 'Other']));
    const handTools = tree.find((node) => node.name === 'Hand Tools');
    const children = (handTools.sub_categories || []).map((child) => child.name);
    expect(children).toEqual(expect.arrayContaining(['Hammer', 'Pliers']));
  });

  test('related products share the same category as the source product', async ({
    request,
    inStockProduct,
  }) => {
    const related = api.rows(await api.relatedProducts(request, inStockProduct.id));
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((item) => item.id !== inStockProduct.id)).toBeTruthy();
  });

  test('POST /payment/check accepts cash-on-delivery @smoke', async ({ request }) => {
    const response = await api.paymentCheck(request, 'cash-on-delivery');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.message).toBe('Payment was successful');
  });

  test('POST /users/register rejects an empty body with 422', async ({ request }) => {
    const response = await api.register(request, {});
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.first_name).toBeTruthy();
    expect(body.last_name).toBeTruthy();
    expect(body.email).toBeTruthy();
    expect(body.password).toBeTruthy();
  });

  test('GET /favorites and GET /users/me reject a missing token', async ({ request }) => {
    const favorites = await api.favorites(request, '');
    expect(favorites.status()).toBe(401);
    const me = await api.me(request, '');
    expect(me.status()).toBe(401);
  });

  test('GET /products?q=zzzznotatool returns an empty page', async ({ request }) => {
    const catalog = await api.products(request, 'zzzznotatool');
    expect(catalog.total ?? api.rows(catalog).length).toBe(0);
  });
});
