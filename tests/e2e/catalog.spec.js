const { test, expect, api } = require('../../src/fixtures');
const { open, openProduct } = require('../../src/app/navigation');
const { catalogPage } = require('../../src/pages/catalog.page');

test.describe('Catalog', () => {
  test('search results match the products API @smoke', async ({ page, request }) => {
    const query = 'Hammer';
    const catalog = await api.products(request, query);
    const names = (catalog.data || catalog).map((item) => item.name);
    const ui = catalogPage(page);

    await open(page, '/');
    await ui.searchQuery.fill(query);
    await ui.searchSubmit.click();

    await expect(ui.searchTerm).toHaveText(query);
    await expect(ui.searchResultCount).toContainText(/hammer/i);
    await expect(ui.productNames.filter({ hasText: /hammer/i }).first()).toBeVisible();
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
