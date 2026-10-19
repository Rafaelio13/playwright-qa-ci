function checkoutPage(page) {
  return {
    addToCart: page.getByTestId('add-to-cart'),
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
