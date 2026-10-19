function productPage(page) {
  return {
    name: page.getByTestId('product-name'),
    unitPrice: page.getByTestId('unit-price'),
    description: page.getByTestId('product-description'),
    quantity: page.getByTestId('quantity'),
    increaseQuantity: page.getByTestId('increase-quantity'),
    addToCart: page.getByTestId('add-to-cart'),
    addToFavorites: page.getByTestId('add-to-favorites'),
    addToCompare: page.getByTestId('add-to-compare'),
    outOfStock: page.getByTestId('out-of-stock'),
  };
}

module.exports = { productPage };
