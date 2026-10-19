const { expect } = require('@playwright/test');

/**
 * Small helpers. No 400-line page objects.
 * The app keeps an open connection, so never wait for networkidle.
 */
async function waitForApp(page) {
  const chrome = page.getByTestId('nav-home');
  const challenge = page.getByRole('heading', { name: /security verification/i });
  await expect(chrome.or(challenge)).toBeVisible({ timeout: 30_000 });
  if (await challenge.isVisible().catch(() => false)) {
    await expect(chrome).toBeVisible({ timeout: 45_000 });
  }
}

async function open(page, path = '/') {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
}

async function injectAuthToken(page, token) {
  await page.addInitScript((value) => {
    window.localStorage.setItem('auth-token', value);
  }, token);
}

async function openProduct(page, product) {
  await open(page, `/product/${product.id}`);
  await expectLoadedProduct(page, product.name);
}

async function expectLoadedProduct(page, name) {
  await expect(page.getByTestId('product-name')).toContainText(name);
}

module.exports = {
  open,
  waitForApp,
  injectAuthToken,
  openProduct,
  expectLoadedProduct,
};
