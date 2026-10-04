import { test, expect, sampleBooking } from '../../fixtures/api';

test.describe('Booking CRUD', () => {
  test('create: POST /booking returns the new booking', async ({ request }) => {
    const data = sampleBooking({ firstname: 'Ada', lastname: 'Lovelace' });
    const res = await request.post('/booking', { data });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.bookingid).toEqual(expect.any(Number));
    expect(body.booking).toEqual(data);
  });

  test('read: GET /booking/:id returns the booking', async ({ request, booking }) => {
    const res = await request.get(`/booking/${booking.id}`);

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(booking.data);
  });

  test('read: GET /booking lists ids including the new one', async ({ request, booking }) => {
    const res = await request.get('/booking');

    expect(res.status()).toBe(200);
    const ids = (await res.json()).map((b: { bookingid: number }) => b.bookingid);
    expect(ids).toContain(booking.id);
  });

  test('update: PUT /booking/:id replaces the booking', async ({ request, booking, authToken }) => {
    const updated = sampleBooking({ firstname: 'Grace', lastname: 'Hopper', totalprice: 999, depositpaid: false });
    const res = await request.put(`/booking/${booking.id}`, {
      data: updated,
      headers: { Cookie: `token=${authToken}` },
    });

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(updated);

    const check = await request.get(`/booking/${booking.id}`);
    expect(await check.json()).toEqual(updated);
  });

  test('update: PATCH /booking/:id changes only the given fields', async ({ request, booking, authToken }) => {
    const res = await request.patch(`/booking/${booking.id}`, {
      data: { firstname: 'Patched' },
      headers: { Cookie: `token=${authToken}` },
    });

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ...booking.data, firstname: 'Patched' });
  });

  test('delete: DELETE /booking/:id removes the booking', async ({ request, booking, authToken }) => {
    const del = await request.delete(`/booking/${booking.id}`, {
      headers: { Cookie: `token=${authToken}` },
    });
    expect(del.status()).toBe(201);

    const after = await request.get(`/booking/${booking.id}`);
    expect(after.status()).toBe(404);
  });
});

test.describe('Booking auth and errors', () => {
  test('update without a token is forbidden', async ({ request, booking }) => {
    const res = await request.put(`/booking/${booking.id}`, { data: sampleBooking() });
    expect(res.status()).toBe(403);
  });

  test('delete without a token is forbidden', async ({ request, booking }) => {
    const res = await request.delete(`/booking/${booking.id}`);
    expect(res.status()).toBe(403);
  });

  test('read of a missing booking returns 404', async ({ request }) => {
    const res = await request.get('/booking/999999999');
    expect(res.status()).toBe(404);
  });

  test('auth with bad credentials returns no token', async ({ request }) => {
    const res = await request.post('/auth', { data: { username: 'admin', password: 'wrong' } });
    expect(res.status()).toBe(200); // API quirk: 200 with a reason field
    expect(await res.json()).toEqual({ reason: 'Bad credentials' });
  });
});

// Data driven: filter bookings by name.
const NAMES = [
  { firstname: 'Alice', lastname: 'Anderson' },
  { firstname: 'Bob', lastname: 'Builder' },
  { firstname: 'Carol', lastname: 'Cole' },
];

test.describe('Booking search (data driven)', () => {
  for (const { firstname, lastname } of NAMES) {
    test(`finds a booking for ${firstname} ${lastname}`, async ({ request, authToken }) => {
      const create = await request.post('/booking', { data: sampleBooking({ firstname, lastname }) });
      const { bookingid } = await create.json();

      const res = await request.get('/booking', { params: { firstname, lastname } });
      expect(res.status()).toBe(200);
      const ids = (await res.json()).map((b: { bookingid: number }) => b.bookingid);
      expect(ids).toContain(bookingid);

      await request.delete(`/booking/${bookingid}`, { headers: { Cookie: `token=${authToken}` } });
    });
  }
});
