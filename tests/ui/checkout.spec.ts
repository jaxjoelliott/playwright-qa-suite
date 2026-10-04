import { test, expect } from '../../fixtures/ui';
import { CHECKOUT_INFO } from '../../data/users';

test.describe('Shopping flow', () => {
  test('logged in user can add an item to the cart and check out', async ({
    loggedInInventory,
    cartPage,
    checkoutPage,
  }) => {
    const product = 'Sauce Labs Backpack';

    await loggedInInventory.addToCart(product);
    await expect(loggedInInventory.cartBadge).toHaveText('1');

    await loggedInInventory.openCart();
    await cartPage.expectItems([product]);
    await cartPage.checkout();

    await checkoutPage.fillInfo(CHECKOUT_INFO);
    await expect(checkoutPage.summaryItems).toHaveCount(1);
    await checkoutPage.finish();

    await checkoutPage.expectOrderComplete();
  });

  test('cart holds multiple items', async ({ loggedInInventory, cartPage }) => {
    const products = ['Sauce Labs Bike Light', 'Sauce Labs Onesie'];
    for (const p of products) await loggedInInventory.addToCart(p);
    await expect(loggedInInventory.cartBadge).toHaveText('2');

    await loggedInInventory.openCart();
    await cartPage.expectItems(products);
  });

  test('checkout requires a first name', async ({ loggedInInventory, cartPage, checkoutPage }) => {
    await loggedInInventory.addToCart('Sauce Labs Backpack');
    await loggedInInventory.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo({ ...CHECKOUT_INFO, firstName: '' });
    await expect(checkoutPage.firstName.page().locator('[data-test="error"]')).toContainText(
      'First Name is required',
    );
  });
});
