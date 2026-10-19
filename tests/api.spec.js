const { test, expect, api, customer } = require('../lib/fixtures');

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
});
