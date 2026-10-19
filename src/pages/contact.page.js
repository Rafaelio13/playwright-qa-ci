function contactPage(page) {
  return {
    firstName: page.getByTestId('first-name'),
    lastName: page.getByTestId('last-name'),
    email: page.getByTestId('email'),
    subject: page.getByTestId('subject'),
    message: page.getByTestId('message'),
    submit: page.getByTestId('contact-submit'),
    firstNameError: page.getByTestId('first-name-error'),
    lastNameError: page.getByTestId('last-name-error'),
    emailError: page.getByTestId('email-error'),
    subjectError: page.getByTestId('subject-error'),
    messageError: page.getByTestId('message-error'),
    confirmation: page.getByRole('alert').filter({ hasText: /thanks for your message/i }),
  };
}

module.exports = { contactPage };
