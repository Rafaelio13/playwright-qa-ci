const { test, expect, customer } = require('../../src/fixtures');
const { open } = require('../../src/app/navigation');
const { loginPage } = require('../../src/pages/login.page');
const { registerPage } = require('../../src/pages/register.page');

test.describe('Authentication', () => {
  test('customer can sign in from the UI @smoke', async ({ page }) => {
    const login = loginPage(page);
    await open(page, '/auth/login');
    await login.email.fill(customer.email);
    await login.password.fill(customer.password);

    const [loginRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/users/login') && res.request().method() === 'POST',
      ),
      login.submit.click(),
    ]);
    expect(loginRes.ok(), `UI login API returned ${loginRes.status()}`).toBeTruthy();

    await expect(login.menu.or(login.challenge)).toBeVisible({ timeout: 15_000 });
    if (await login.menu.isVisible()) {
      await expect(login.pageTitle).toContainText('My account');
    }
  });

  test('invalid password stays on login and shows an error @smoke', async ({ page }) => {
    const login = loginPage(page);
    await open(page, '/auth/login');
    await login.email.fill(customer.email);
    await login.password.fill('wrong-password');
    await login.submit.click();

    await expect(login.error).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('empty register form stays on the page and shows required errors @smoke', async ({
    page,
  }) => {
    const register = registerPage(page);
    await open(page, '/auth/register');
    await expect(register.form).toBeVisible();
    await register.submit.click();

    await expect(register.firstNameError).toBeVisible();
    await expect(register.lastNameError).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/register/);
  });
});
