/**
 * Public demo accounts published by Testsmith for Toolshop.
 * Not secrets. Do not point this repo at a real product.
 */
module.exports = {
  apiUrl: process.env.API_URL || 'https://api.practicesoftwaretesting.com',
  customer: {
    email: process.env.CUSTOMER_EMAIL || 'customer@practicesoftwaretesting.com',
    password: process.env.CUSTOMER_PASSWORD || 'welcome01',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@practicesoftwaretesting.com',
    password: process.env.ADMIN_PASSWORD || 'welcome01',
  },
};
