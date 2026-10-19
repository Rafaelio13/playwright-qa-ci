const { test, expect, api } = require('../../src/fixtures');
const { open, openProduct } = require('../../src/app/navigation');
const { catalogPage } = require('../../src/pages/catalog.page');
const { productPage } = require('../../src/pages/product.page');

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

  test('sort Name (A-Z) matches GET /products?sort=name,asc', async ({ page, request }) => {
    const catalog = await api.productsByQuery(request, { sort: 'name,asc' });
    const apiNames = api.rows(catalog).map((item) => item.name);
    const ui = catalogPage(page);

    await open(page, '/');
    await ui.sort.selectOption('name,asc');
    await expect(ui.sortingDone).toBeVisible();

    const uiNames = (await ui.productNames.allTextContents()).map((name) => name.trim());
    expect(uiNames.length).toBeGreaterThan(0);
    expect(uiNames[0]).toBe(apiNames[0]);
    expect(uiNames).toEqual(apiNames.slice(0, uiNames.length));
  });

  test('Hammer category filter matches GET /products?by_category=', async ({ page, request }) => {
    const categories = await api.categories(request);
    const hammer = api.firstMatching(categories, (item) => item.slug === 'hammer');
    const catalog = await api.allProductsByQuery(request, { by_category: hammer.id });
    const apiNames = catalog.map((item) => item.name);
    const ui = catalogPage(page);

    await open(page, '/');
    await ui.categoryCheckbox(hammer.id).check();
    await expect(ui.filterDone).toBeVisible();

    const uiNames = (await ui.productNames.allTextContents()).map((name) => name.trim());
    expect(uiNames.length).toBeGreaterThan(0);
    for (const name of uiNames) {
      expect(apiNames, `UI product "${name}" was not in the Hammer API list`).toContain(name);
    }
  });

  test('brand filter keeps only that brand on the first page', async ({ page, request }) => {
    const brandList = await api.brands(request);
    const brand = api.firstMatching(brandList, (item) => item.name === 'ForgeFlex Tools');
    const catalog = await api.allProductsByQuery(request, { by_brand: brand.id });
    const apiNames = catalog.map((item) => item.name);
    const ui = catalogPage(page);

    await open(page, '/');
    await ui.brandCheckbox(brand.id).check();
    await expect(ui.filterDone).toBeVisible();

    const uiNames = (await ui.productNames.allTextContents()).map((name) => name.trim());
    expect(uiNames.length).toBeGreaterThan(0);
    for (const name of uiNames) {
      expect(apiNames, `UI product "${name}" was not a ForgeFlex Tools product`).toContain(name);
    }
  });

  test('search with no matches shows the empty state @smoke', async ({ page }) => {
    const ui = catalogPage(page);
    await open(page, '/');
    await ui.searchQuery.fill('zzzznotatool');
    await ui.searchSubmit.click();
    await expect(ui.noResults).toHaveText(/no products found/i);
  });

  test('Hand Tools nav opens the category listing', async ({ page }) => {
    const ui = catalogPage(page);
    await open(page, '/');
    await ui.navCategories.click();
    await ui.navHandTools.click();
    await expect(page).toHaveURL(/\/category\/hand-tools/);
    await expect(ui.pageTitle).toContainText(/hand tools/i);
  });

  test('product detail lists related products from the API', async ({
    page,
    request,
    inStockProduct,
  }) => {
    const related = api.rows(await api.relatedProducts(request, inStockProduct.id));
    expect(related.length).toBeGreaterThan(0);

    const pdp = productPage(page);
    await openProduct(page, inStockProduct);
    await expect(pdp.description).toBeVisible();
    await expect(page.getByRole('heading', { name: /related products/i })).toBeVisible();
    await expect(page.getByText(related[0].name, { exact: true }).first()).toBeVisible();
  });

  test('compare button opens the comparison bar', async ({ page }) => {
    const ui = catalogPage(page);
    await open(page, '/');
    await expect(ui.compareButtons.first()).toBeVisible();
    await ui.compareButtons.first().click();
    await expect(ui.comparisonBar).toBeVisible();
  });
});
