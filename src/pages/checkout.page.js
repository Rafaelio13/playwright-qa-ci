function checkoutPage(page) {
  return {
    addToCart: page.getByTestId('add-to-cart'),
    quantity: page.getByTestId('quantity'),
    increaseQuantity: page.getByTestId('increase-quantity'),
    decreaseQuantity: page.getByTestId('decrease-quantity'),
    cartQuantity: page.getByTestId('cart-quantity'),
    productQuantity: page.getByTestId('product-quantity'),
    productPrice: page.getByTestId('product-price'),
    linePrice: page.getByTestId('line-price'),
    cartTotal: page.getByTestId('cart-total'),
    navCart: page.getByTestId('nav-cart'),
    productTitle: page.getByTestId('product-title'),
    proceedCart: page.getByTestId('proceed-1'),
    proceedSignIn: page.getByTestId('proceed-2'),
    proceedAddress: page.getByTestId('proceed-3'),
    country: page.getByTestId('country'),
    postalCode: page.getByTestId('postal_code'),
    houseNumber: page.getByTestId('house_number'),
    street: page.getByTestId('street'),
    city: page.getByTestId('city'),
    state: page.getByTestId('state'),
    lookupLoading: page.getByTestId('postcode-lookup-loading'),
    paymentMethod: page.getByTestId('payment-method'),
    finish: page.getByTestId('finish'),
    paymentSuccess: page.getByTestId('payment-success-message'),
    confirmation: page.locator('#order-confirmation'),
  };
}

module.exports = { checkoutPage };
