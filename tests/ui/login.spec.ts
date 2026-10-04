import { test, expect } from '../../fixtures/ui';
import { INVALID_LOGINS, STANDARD_USER } from '../../data/users';

test.describe('Login', () => {
  test('standard user can log in', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(STANDARD_USER.username, STANDARD_USER.password);
    await inventoryPage.expectLoaded();
  });

  // Data driven: same check, several inputs.
  for (const { name, username, password, error } of INVALID_LOGINS) {
    test(`rejects login: ${name}`, async ({ page, loginPage }) => {
      await loginPage.goto();
      await loginPage.login(username, password);
      await loginPage.expectError(error);
      await expect(page).toHaveURL('/');
    });
  }
});
