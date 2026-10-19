const { expect } = require('@playwright/test');
const { checkoutPage } = require('../pages/checkout.page');
const { openProduct } = require('../app/navigation');

/**
 * Shared NL billing address. Toolshop validates city against country;
 * Vienna + AT is rejected. Lookup may fill street/city after postcode.
 */
const NL_ADDRESS = {
  country: 'NL',
  postalCode: '1011AB',
  houseNumber: '1',
  street: 'Autarboulevard',
  city: 'Amsterdam',
  state: 'Noord-Holland',
};

async function addProductAndOpenCart(page, product) {
  const checkout = checkoutPage(page);
  await openProduct(page, product);
  await expect(checkout.addToCart).toBeEnabled();
  await checkout.addToCart.click();
  await checkout.navCart.click();
  await expect(checkout.productTitle.first()).toContainText(product.name);
}

async function applyAddress(checkout, address) {
  await checkout.country.selectOption(address.country);
  await checkout.postalCode.fill(address.postalCode);
  await checkout.houseNumber.fill(address.houseNumber);
  await checkout.street.fill(address.street);
  await checkout.city.fill(address.city);
  await checkout.state.fill(address.state);
}

async function fillBillingAddress(page, address = NL_ADDRESS) {
  const checkout = checkoutPage(page);
  await expect(checkout.street).toBeVisible();
  // Profile hydrates Vienna/AT after first paint; wait, then overwrite with NL.
  await expect
    .poll(async () => (await checkout.street.inputValue()) !== '', { timeout: 8_000 })
    .toBeTruthy();
  await applyAddress(checkout, address);
  await checkout.lookupLoading.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
  await checkout.lookupLoading.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
  await applyAddress(checkout, address);
  await expect(checkout.country).toHaveValue(address.country);
  await expect(checkout.city).toHaveValue(address.city);
  await expect(checkout.proceedAddress).toBeEnabled();
  await checkout.proceedAddress.click();
}

async function payCashOnDelivery(page) {
  const checkout = checkoutPage(page);
  await checkout.paymentMethod.selectOption('cash-on-delivery');
  await checkout.finish.click();
  await expect(checkout.paymentSuccess).toBeVisible();
  // First Confirm only validates payment; the second creates the invoice.
  const invoiceCall = page.waitForResponse(
    (res) => res.url().includes('/invoices') && res.request().method() === 'POST',
  );
  await checkout.finish.click();
  const invoiceRes = await invoiceCall;
  expect(invoiceRes.ok(), `create invoice returned ${invoiceRes.status()}`).toBeTruthy();
  await expect(checkout.confirmation).toBeVisible({ timeout: 20_000 });
}

async function checkoutInStockProduct(page, product) {
  const checkout = checkoutPage(page);
  await addProductAndOpenCart(page, product);
  await checkout.proceedCart.click();
  await checkout.proceedSignIn.click();
  await fillBillingAddress(page);
  await payCashOnDelivery(page);
}

module.exports = {
  NL_ADDRESS,
  addProductAndOpenCart,
  fillBillingAddress,
  payCashOnDelivery,
  checkoutInStockProduct,
};
