const { test, expect, api } = require('../../src/fixtures');
const { checkoutInStockProduct } = require('../../src/flows/checkout.flow');

test.describe('Checkout', () => {
  test('UI checkout creates an invoice the API can see', async ({
    asCustomer,
    request,
    customerToken,
    inStockProduct,
  }) => {
    const before = await api.invoices(request, customerToken);
    const beforeCount = before.total ?? (before.data || []).length;

    await checkoutInStockProduct(asCustomer, inStockProduct);

    await expect
      .poll(
        async () => {
          const after = await api.invoices(request, customerToken);
          return after.total ?? (after.data || []).length;
        },
        { timeout: 20_000 },
      )
      .toBeGreaterThan(beforeCount);

    const after = await api.invoices(request, customerToken);
    const lines = (after.data || []).flatMap((invoice) => invoice.invoicelines || []);
    const names = lines.map((line) => line.product?.name).filter(Boolean);
    expect(names, 'invoice lines did not include the product just bought').toContain(
      inStockProduct.name,
    );
  });
});
