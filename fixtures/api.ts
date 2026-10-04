import { test as base, APIRequestContext, expect } from '@playwright/test';

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
}

export const sampleBooking = (overrides: Partial<Booking> = {}): Booking => ({
  firstname: 'Jim',
  lastname: 'Brown',
  totalprice: 111,
  depositpaid: true,
  bookingdates: { checkin: '2026-01-01', checkout: '2026-01-05' },
  additionalneeds: 'Breakfast',
  ...overrides,
});

type ApiFixtures = {
  /** Auth token for PUT/PATCH/DELETE. */
  authToken: string;
  /** A booking created before the test and deleted afterwards. */
  booking: { id: number; data: Booking };
};

async function createBooking(request: APIRequestContext, data: Booking) {
  const res = await request.post('/booking', { data });
  expect(res.status()).toBe(200);
  const body = await res.json();
  return body.bookingid as number;
}

export const test = base.extend<ApiFixtures>({
  authToken: async ({ request }, use) => {
    const res = await request.post('/auth', {
      data: { username: 'admin', password: 'password123' },
    });
    expect(res.ok()).toBeTruthy();
    const { token } = await res.json();
    expect(token).toBeTruthy();
    await use(token);
  },

  booking: async ({ request, authToken }, use) => {
    const data = sampleBooking();
    const id = await createBooking(request, data);
    await use({ id, data });
    // Best-effort cleanup; the test may already have deleted it.
    await request.delete(`/booking/${id}`, { headers: { Cookie: `token=${authToken}` } });
  },
});

export { expect } from '@playwright/test';
