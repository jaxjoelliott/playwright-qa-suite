# Playwright QA Suite

[![Playwright Tests](https://github.com/jaxjoelliott/playwright-qa-suite/actions/workflows/playwright.yml/badge.svg)](https://github.com/jaxjoelliott/playwright-qa-suite/actions/workflows/playwright.yml)

End-to-end UI tests and API tests written with [Playwright](https://playwright.dev) and TypeScript. They run against two public practice sites, so nothing needs to be installed or hosted locally.

| Layer | System under test | Tests |
|-------|-------------------|-------|
| UI    | [SauceDemo](https://www.saucedemo.com) | login, cart, checkout |
| API   | [Restful-Booker](https://restful-booker.herokuapp.com) | booking create / read / update / delete |

## What's tested, and why

**UI (`tests/ui`)**
- **Checkout flow:** log in, add an item, go to the cart, enter details, finish. This is the revenue-critical path, so it gets a full end-to-end test.
- **Multiple items in the cart:** checks the cart badge and cart contents agree.
- **Checkout validation:** a missing first name must block the order.
- **Login (data driven):** one test body runs over five invalid inputs (wrong password, unknown user, locked-out user, empty username, empty password). Adding a case is one line in `data/users.ts`.

**API (`tests/api`)**
- **CRUD:** `POST`, `GET` (single and list), `PUT`, `PATCH`, `DELETE`. Each checks the status code and the full response body, and updates and deletes are confirmed with a follow-up `GET`.
- **Auth and errors:** writes without a token return 403, a missing booking returns 404, and bad credentials return no token.
- **Search (data driven):** the same create-then-filter check runs over several names.

## Structure

```
pages/       Page objects: locators and actions for each screen
fixtures/    ui.ts (page objects, logged-in state) and api.ts (auth token, self-cleaning booking)
data/        Test data shared across specs
tests/ui/    Browser tests
tests/api/   Tests using Playwright's `request` fixture
.github/workflows/playwright.yml   CI
```

Design choices:
- Specs contain assertions about behaviour; selectors live only in page objects.
- Fixtures handle setup and teardown. The API `booking` fixture creates a booking before the test and deletes it after, so tests stay independent and can run in parallel.
- Locators prefer roles, placeholders and `data-test` attributes over CSS paths.

## Running locally

Requires Node 20+.

```bash
npm install
npx playwright install chromium

npm test            # everything
npm run test:ui     # UI only
npm run test:api    # API only
npm run report      # open the HTML report
npm run typecheck
```

## CI

`.github/workflows/playwright.yml` runs the typecheck and the full suite on every push and pull request, then uploads `playwright-report/` as a build artifact (even when tests fail). Open a workflow run and download **playwright-report** to browse results, with traces for retried tests.

## Notes

Both sites are shared public services, so an occasional failure can come from the service rather than the tests. CI retries failed tests twice to absorb this.
