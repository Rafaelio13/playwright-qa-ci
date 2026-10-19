const { test, expect, api, customer } = require('../../src/fixtures');
const { open } = require('../../src/app/navigation');
const { accountPage } = require('../../src/pages/account.page');

test.describe('Account', () => {
  test('profile fields match GET /users/me @smoke', async ({
    asCustomer,
    request,
    customerToken,
  }) => {
    const meRes = await api.me(request, customerToken);
    expect(meRes.ok()).toBeTruthy();
    const me = await meRes.json();

    const account = accountPage(asCustomer);
    await open(asCustomer, '/account/profile');
    await expect(account.pageTitle).toHaveText(/profile/i);
    await expect(account.firstName).toHaveValue(me.first_name);
    await expect(account.lastName).toHaveValue(me.last_name);
    await expect(account.email).toHaveValue(customer.email);
    await expect(account.email).toHaveValue(me.email);
  });

  test('invoices page lists rows the API already knows about', async ({
    asCustomer,
    request,
    customerToken,
  }) => {
    const invoices = await api.invoices(request, customerToken);
    const rows = invoices.data || [];

    const account = accountPage(asCustomer);
    await open(asCustomer, '/account/invoices');
    await expect(account.pageTitle).toHaveText(/invoices/i);

    if (rows.length) {
      await expect(asCustomer.getByRole('row').nth(1)).toBeVisible();
      const firstNumber = rows[0].invoice_number;
      if (firstNumber) {
        await expect(asCustomer.getByText(String(firstNumber))).toBeVisible();
      }
    }
  });
});
