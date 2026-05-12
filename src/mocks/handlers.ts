import { http, HttpResponse } from 'msw';
import type { Appointment, InsertAppointment, Service } from '@/types';

export const TEST_SUPABASE_URL = 'http://localhost:54321';

// ─── Seed data ────────────────────────────────────────────────────────────────

export const mockServices: Service[] = [
  {
    id: 'svc-1',
    name: 'Oil Change',
    description: 'Full synthetic oil change with filter replacement',
    price: 79.99,
    duration: 45,
    category: 'maintenance',
    hidden: false,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'svc-2',
    name: 'Brake Inspection',
    description: 'Full brake system inspection and report',
    price: 49.99,
    duration: 60,
    category: 'safety',
    hidden: false,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    user_id: 'user-abc',
    service_id: 'svc-1',
    vehicle_make: 'Toyota',
    vehicle_model: 'Camry',
    vehicle_year: 2020,
    slot_date: '2026-05-20',
    slot_time: '09:00',
    status: 'pending',
    contact_name: 'Jane Doe',
    contact_phone: '555-0100',
    contact_email: 'jane@example.com',
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
    service: mockServices[0],
  },
];

// ─── Default handlers ─────────────────────────────────────────────────────────

export const handlers = [
  // GET /services — return visible services list
  http.get(`${TEST_SUPABASE_URL}/rest/v1/services`, () => {
    return HttpResponse.json(mockServices);
  }),

  /**
   * GET /appointments — simulates RLS.
   * - service_role apikey → all records (admin bypass)
   * - anon apikey without a user JWT → empty array (no authenticated user)
   * - anon apikey with a user JWT → user's own records
   */
  http.get(`${TEST_SUPABASE_URL}/rest/v1/appointments`, ({ request }) => {
    const apiKey = request.headers.get('apikey');
    const auth = request.headers.get('Authorization');

    if (apiKey === 'test-service-key') {
      return HttpResponse.json(mockAppointments);
    }

    // No valid JWT → RLS returns nothing (user not authenticated)
    if (!auth || auth === `Bearer test-anon-key`) {
      return HttpResponse.json([]);
    }

    return HttpResponse.json(mockAppointments);
  }),

  /**
   * POST /appointments — simulates a successful insert.
   * Returns a single object (PostgREST vnd.pgrst.object+json response).
   */
  http.post(`${TEST_SUPABASE_URL}/rest/v1/appointments`, async ({ request }) => {
    const body = (await request.json()) as Partial<InsertAppointment>;

    const created: Appointment = {
      id: 'apt-new',
      user_id: 'user-abc',
      service_id: body.service_id ?? 'svc-1',
      vehicle_make: body.vehicle_make ?? '',
      vehicle_model: body.vehicle_model ?? '',
      vehicle_year: body.vehicle_year ?? 2020,
      vehicle_vin: body.vehicle_vin,
      slot_date: body.slot_date ?? '',
      slot_time: body.slot_time ?? '',
      status: 'pending',
      notes: body.notes,
      contact_name: body.contact_name ?? '',
      contact_phone: body.contact_phone ?? '',
      contact_email: body.contact_email ?? '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(created, { status: 201 });
  }),

  // PATCH /appointments — simulates a status update
  http.patch(`${TEST_SUPABASE_URL}/rest/v1/appointments`, async ({ request }) => {
    const body = (await request.json()) as Partial<Appointment>;
    const updated = { ...mockAppointments[0], ...body, updated_at: new Date().toISOString() };
    return HttpResponse.json(updated);
  }),
];

// ─── One-off override handlers (used in specific tests) ───────────────────────

/** Simulates a 403 RLS rejection — use with server.use(rlsFailureHandler). */
export const rlsFailureHandler = http.get(
  `${TEST_SUPABASE_URL}/rest/v1/appointments`,
  () =>
    HttpResponse.json(
      { code: '42501', message: 'new row violates row-level security policy' },
      { status: 403 },
    ),
);
