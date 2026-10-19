const { test, expect } = require('../../src/fixtures');
const { open } = require('../../src/app/navigation');

test.describe('Permissions', () => {
  test('customer is sent to login instead of the admin dashboard', async ({ asCustomer }) => {
    await open(asCustomer, '/admin/dashboard');
    await expect(asCustomer).toHaveURL(/\/auth\/login/);
    await expect(asCustomer.getByTestId('nav-admin-dashboard')).toHaveCount(0);
  });

  test('admin can open the dashboard', async ({ asAdmin }) => {
    await open(asAdmin, '/admin/dashboard');
    await expect(asAdmin).toHaveURL(/\/admin\/dashboard/);
    await asAdmin.getByTestId('nav-menu').click();
    await expect(asAdmin.getByTestId('nav-admin-dashboard')).toBeVisible();
  });
});
