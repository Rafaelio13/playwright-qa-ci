const { test, expect, api } = require('../../src/fixtures');
const { open, openProduct } = require('../../src/app/navigation');
const { productPage } = require('../../src/pages/product.page');
const { accountPage } = require('../../src/pages/account.page');

test.describe('Favorites', () => {
  test('guest cannot add a product to favorites @smoke', async ({ page, inStockProduct }) => {
    const pdp = productPage(page);
    await openProduct(page, inStockProduct);
    await pdp.addToFavorites.click();
    await expect(page.getByText(/unauthorized, can not add product/i)).toBeVisible();
  });

  test('customer can add a favorite, see it on the account page, then remove it', async ({
    asCustomer,
    request,
    customerToken,
  }) => {
    const existingRes = await api.favorites(request, customerToken);
    expect(existingRes.ok()).toBeTruthy();
    const existing = api.rows(await existingRes.json());
    const favorited = new Set(existing.map((row) => row.product_id));

    const catalog = await api.products(request);
    const candidate = api.firstMatching(
      catalog,
      (item) => item.in_stock === true && !item.is_rental && !favorited.has(item.id),
    );

    const pdp = productPage(asCustomer);
    await openProduct(asCustomer, candidate);

    try {
      const [createRes] = await Promise.all([
        asCustomer.waitForResponse(
          (res) => res.url().includes('/favorites') && res.request().method() === 'POST',
        ),
        pdp.addToFavorites.click(),
      ]);
      expect(createRes.status(), `add favorite returned ${createRes.status()}`).toBe(201);
      await expect(asCustomer.getByText(/product added to your favorites list/i)).toBeVisible();

      const listed = await api.favorites(request, customerToken);
      const afterAdd = api.rows(await listed.json());
      const created = afterAdd.find((row) => row.product_id === candidate.id);
      expect(created, 'API favorites did not include the product just starred').toBeTruthy();

      const account = accountPage(asCustomer);
      await account.navMenu.click();
      await account.navFavorites.click();
      await expect(account.pageTitle).toHaveText(/favorites/i);
      const card = account.favoriteCard(candidate.name);
      await expect(card).toBeVisible();

      await card.getByTestId('delete').click();
      await expect(card).toHaveCount(0);
    } finally {
      const leftoverRes = await api.favorites(request, customerToken);
      const leftover = api
        .rows(await leftoverRes.json())
        .find((row) => row.product_id === candidate.id);
      if (leftover?.id) {
        await api.deleteFavorite(request, customerToken, leftover.id);
      }
    }
  });
});
