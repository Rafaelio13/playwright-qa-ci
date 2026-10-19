const { test, expect, customer } = require('../lib/fixtures');
const { open } = require('../lib/app');

test.describe('Authentication', () => {
  test('customer can sign in from the UI @smoke', async ({ page }) => {
    await open(page, '/auth/login');

    await page.getByTestId('email').fill(customer.email);
    await page.getByTestId('password').fill(customer.password);

    const [loginRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/users/login') && res.request().method() === 'POST',
      ),
      page.getByTestId('login-submit').click(),
    ]);
    expect(loginRes.ok(), `UI login API returned ${loginRes.status()}`).toBeTruthy();

    const menu = page.getByTestId('nav-menu');
    const challenge = page.getByRole('heading', { name: /security verification/i });
    await expect(menu.or(challenge)).toBeVisible({ timeout: 15_000 });
    if (await menu.isVisible()) {
      await expect(page.getByTestId('page-title')).toContainText('My account');
    }
  });

  test('invalid password stays on login and shows an error @smoke', async ({ page }) => {
    await open(page, '/auth/login');
    await page.getByTestId('email').fill(customer.email);
    await page.getByTestId('password').fill('wrong-password');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
