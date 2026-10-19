const { test, expect } = require('../../src/fixtures');
const { open } = require('../../src/app/navigation');
const { contactPage } = require('../../src/pages/contact.page');

test.describe('Contact', () => {
  test('empty submit shows required-field errors @smoke', async ({ page }) => {
    const contact = contactPage(page);
    const meCall = page.waitForResponse((res) => res.url().includes('/users/me'));
    await open(page, '/contact');
    await meCall.catch(() => {});
    await expect(contact.firstName).toBeVisible();
    await contact.submit.click();

    await expect(contact.firstNameError).toBeVisible();
    await expect(contact.lastNameError).toBeVisible();
    await expect(contact.emailError).toBeVisible();
    await expect(contact.subjectError).toBeVisible();
    await expect(contact.messageError).toBeVisible();
  });

  test('message shorter than 50 characters is rejected', async ({ page }) => {
    const contact = contactPage(page);
    await open(page, '/contact');
    await contact.firstName.fill('Pat');
    await contact.lastName.fill('Tester');
    await contact.email.fill('customer@practicesoftwaretesting.com');
    await contact.subject.selectOption('customer-service');
    await contact.message.fill('too short');
    await contact.message.blur();
    await contact.submit.click();

    await expect(contact.messageError).toContainText(/minimal 50 characters/i);
    await expect(contact.confirmation).toHaveCount(0);
  });

  test('valid form shows the confirmation alert', async ({ page }) => {
    const contact = contactPage(page);
    const stamp = Date.now();
    await open(page, '/contact');
    await contact.firstName.fill('Pat');
    await contact.lastName.fill('Tester');
    await contact.email.fill('customer@practicesoftwaretesting.com');
    await contact.subject.selectOption('webmaster');
    await contact.message.fill(
      `Playwright portfolio contact check ${stamp}. This sentence exists only to clear the 50-character minimum.`,
    );

    const [messageRes] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/messages') && res.request().method() === 'POST',
      ),
      contact.submit.click(),
    ]);
    expect(messageRes.ok(), `contact POST returned ${messageRes.status()}`).toBeTruthy();
    await expect(contact.confirmation).toBeVisible();
  });
});
