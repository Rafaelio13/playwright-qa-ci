const { test, expect } = require('../../src/fixtures');
const { open, openProduct } = require('../../src/app/navigation');
const { checkoutPage } = require('../../src/pages/checkout.page');

function money(text) {
  const match = String(text).replace(/,/g, '').match(/(\d+\.\d{2})/);
  expect(match, `could not parse money from "${text}"`).toBeTruthy();
  return Number(match[1]);
}

test.describe('Cart', () => {
  test('empty cart hides the header badge and has no line items @smoke', async ({ page }) => {
    const cart = checkoutPage(page);
    await open(page, '/');
    await expect(cart.navCart).toHaveCount(0);
    await open(page, '/checkout');
    await expect(cart.productTitle).toHaveCount(0);
    await expect(cart.proceedCart).toHaveCount(0);
  });

  test('quantity 2 on the PDP updates the badge and the line total', async ({
    page,
    inStockProduct,
  }) => {
    const cart = checkoutPage(page);
    await openProduct(page, inStockProduct);
    await expect(cart.increaseQuantity).toBeEnabled();
    await cart.increaseQuantity.click();
    await expect(cart.quantity).toHaveValue('2');
    await cart.addToCart.click();

    await expect(cart.cartQuantity).toHaveText('2');
    await cart.navCart.click();
    await expect(cart.productTitle.first()).toContainText(inStockProduct.name);
    await expect(cart.productQuantity.first()).toHaveValue('2');

    const unit = money(await cart.productPrice.first().innerText());
    const line = money(await cart.linePrice.first().innerText());
    expect(line).toBeCloseTo(unit * 2, 2);
    expect(unit).toBeCloseTo(Number(inStockProduct.price), 2);
  });
});
