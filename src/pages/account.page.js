function accountPage(page) {
  return {
    pageTitle: page.getByTestId('page-title'),
    firstName: page.getByTestId('first-name'),
    lastName: page.getByTestId('last-name'),
    email: page.getByTestId('email'),
    navMenu: page.getByTestId('nav-menu'),
    navFavorites: page.getByTestId('nav-my-favorites'),
    navProfile: page.getByTestId('nav-my-profile'),
    navInvoices: page.getByTestId('nav-my-invoices'),
    productNames: page.getByTestId('product-name'),
    favoriteCard: (productName) =>
      page.locator('[data-test^="favorite-"]').filter({ hasText: productName }),
  };
}

module.exports = { accountPage };
