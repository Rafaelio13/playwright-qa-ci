const { test: base, expect } = require('@playwright/test');
const api = require('../api/toolshop.api');
const { customer, admin } = require('../config/env');
const { injectAuthToken } = require('../app/navigation');

const test = base.extend({
  customerToken: async ({ request }, use) => {
    const token = await api.loginToken(request, customer.email, customer.password);
    await use(token);
  },
  adminToken: async ({ request }, use) => {
    const token = await api.loginToken(request, admin.email, admin.password);
    await use(token);
  },
  asCustomer: async ({ page, customerToken }, use) => {
    await injectAuthToken(page, customerToken);
    await use(page);
  },
  asAdmin: async ({ page, adminToken }, use) => {
    await injectAuthToken(page, adminToken);
    await use(page);
  },
  inStockProduct: async ({ request }, use) => {
    const catalog = await api.products(request);
    const product = api.firstMatching(catalog, (item) => item.in_stock === true && !item.is_rental);
    await use(product);
  },
  outOfStockProduct: async ({ request }, use) => {
    const catalog = await api.products(request);
    const product = api.firstMatching(catalog, (item) => item.in_stock === false);
    await use(product);
  },
});

module.exports = { test, expect, api, customer, admin };
