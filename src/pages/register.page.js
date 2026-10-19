function registerPage(page) {
  return {
    form: page.getByTestId('register-form'),
    firstName: page.getByTestId('first-name'),
    submit: page.getByTestId('register-submit'),
    firstNameError: page.getByTestId('first-name-error'),
    lastNameError: page.getByTestId('last-name-error'),
    emailError: page.getByTestId('email-error'),
    passwordError: page.getByTestId('password-error'),
  };
}

module.exports = { registerPage };
