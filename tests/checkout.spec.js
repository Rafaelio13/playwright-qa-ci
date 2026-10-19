const { test, expect, api } = require('../lib/fixtures');
const { openProduct } = require('../lib/app');

test.describe('Checkout', () => {
  test('UI checkout creates an invoice the API can see', async ({
    asCustomer,
    request,
    customerToken,
    inStockProduct,
  }) => {
    const before = await api.invoices(request, customerToken);
    const beforeCount = before.total ?? (before.data || []).length;

    await openProduct(asCustomer, inStockProduct);
    await expect(asCustomer.getByTestId('add-to-cart')).toBeEnabled();
    await asCustomer.getByTestId('add-to-cart').click();
    await asCustomer.getByTestId('nav-cart').click();

    await expect(asCustomer.getByTestId('product-title').first()).toContainText(
      inStockProduct.name,
    );
    await asCustomer.getByTestId('proceed-1').click();
    await asCustomer.getByTestId('proceed-2').click();

    await expect(asCustomer.getByTestId('street')).toBeVisible();
    await asCustomer.getByTestId('country').selectOption('NL');
    await asCustomer.getByTestId('postal_code').fill('1011AB');
    await asCustomer.getByTestId('house_number').fill('1');
    await asCustomer.getByTestId('postcode-lookup-loading').waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    await asCustomer.getByTestId('postcode-lookup-loading').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    if (!(await asCustomer.getByTestId('street').inputValue())) {
      await asCustomer.getByTestId('street').fill('Autarboulevard');
    }
    if (!(await asCustomer.getByTestId('city').inputValue())) {
      await asCustomer.getByTestId('city').fill('Amsterdam');
    }
    if (!(await asCustomer.getByTestId('state').inputValue())) {
      await asCustomer.getByTestId('state').fill('Noord-Holland');
    }
    await expect(asCustomer.getByTestId('proceed-3')).toBeEnabled();
    await asCustomer.getByTestId('proceed-3').click();

    await asCustomer.getByTestId('payment-method').selectOption('cash-on-delivery');
    await asCustomer.getByTestId('finish').click();
    await expect(asCustomer.getByTestId('payment-success-message')).toBeVisible();
    // Toolshop's first Confirm only validates payment; the second creates the invoice.
    const invoiceCall = asCustomer.waitForResponse(
      (res) => res.url().includes('/invoices') && res.request().method() === 'POST',
    );
    await asCustomer.getByTestId('finish').click();
    const invoiceRes = await invoiceCall;
    expect(invoiceRes.ok(), `create invoice returned ${invoiceRes.status()}`).toBeTruthy();
    await expect(asCustomer.locator('#order-confirmation')).toBeVisible({ timeout: 20_000 });

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
