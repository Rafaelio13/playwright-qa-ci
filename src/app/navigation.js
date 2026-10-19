const { expect } = require('@playwright/test');

/**
 * Toolshop keeps an open connection, so never wait for networkidle.
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
  await expect(page.getByTestId('product-name')).toContainText(product.name);
}

module.exports = {
  waitForApp,
  open,
  injectAuthToken,
  openProduct,
};
