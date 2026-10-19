const { test, expect, api } = require('../lib/fixtures');
const { open, openProduct } = require('../lib/app');

test.describe('Catalog', () => {
  test('search results match the products API @smoke', async ({ page, request }) => {
    const query = 'Hammer';
    const catalog = await api.products(request, query);
    const names = (catalog.data || catalog).map((item) => item.name);

    await open(page, '/');
    await page.getByTestId('search-query').fill(query);
    await page.getByTestId('search-submit').click();

    await expect(page.getByTestId('search-term')).toHaveText(query);
    await expect(page.getByTestId('search-result-count')).toContainText(/hammer/i);
    await expect(page.getByTestId('product-name').filter({ hasText: /hammer/i }).first()).toBeVisible();
    expect(
      names.some((name) => /hammer/i.test(name)),
      'API search for Hammer returned no hammers',
    ).toBeTruthy();
  });

  test('out-of-stock product matches API and cannot be added to cart', async ({
    page,
    request,
    outOfStockProduct,
  }) => {
    const fromApi = await api.productById(request, outOfStockProduct.id);
    expect(fromApi.in_stock).toBe(false);

    await openProduct(page, outOfStockProduct);
    await expect(page.getByTestId('out-of-stock')).toBeVisible();
    await expect(page.getByTestId('add-to-cart')).toBeDisabled();
  });
});
