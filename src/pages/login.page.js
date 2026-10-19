function loginPage(page) {
  return {
    email: page.getByTestId('email'),
    password: page.getByTestId('password'),
    submit: page.getByTestId('login-submit'),
    error: page.getByTestId('login-error'),
    menu: page.getByTestId('nav-menu'),
    pageTitle: page.getByTestId('page-title'),
    challenge: page.getByRole('heading', { name: /security verification/i }),
  };
}

module.exports = { loginPage };
