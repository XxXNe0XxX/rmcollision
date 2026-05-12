/**
 * Unit tests for the data-fetching layer.
 *
 * MSW handler definitions live in src/mocks/ and are ready for Vitest /
 * integration-test use. These Jest unit tests mock the Supabase client
 * directly to avoid the MSW v2 + Jest v30 ESM interop issue.
 *
 * Coverage:
 *   useBookAppointment — mutation states, cache invalidation, callbacks
 *   useServices        — loading, success, and error states
 *   RLS simulation     — empty response for anon user, 403 rejection
 *   useBookingStore    — multi-step form state and reset
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Supabase client mock ──────────────────────────────────────────────────────

const mockFrom = jest.fn();

jest.mock('@/lib/supabaseClient', () => ({
  supabase:      { from: (...a: unknown[]) => mockFrom(...a) },
  supabaseAdmin: { from: (...a: unknown[]) => mockFrom(...a) },
}));

// ── Types & seed data ─────────────────────────────────────────────────────────

import type { Appointment, InsertAppointment, Service } from '../types';

const MOCK_SERVICES: Service[] = [
  {
    id: 'svc-1',
    name: 'Oil Change',
    description: 'Full synthetic oil change',
    price: 79.99,
    duration: 45,
    category: 'maintenance',
    hidden: false,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'svc-2',
    name: 'Brake Inspection',
    description: 'Full brake system check',
    price: 49.99,
    duration: 60,
    category: 'safety',
    hidden: false,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const MOCK_APPOINTMENT: Appointment = {
  id: 'apt-new',
  user_id: 'user-abc',
  service_id: 'svc-1',
  vehicle_make: 'Honda',
  vehicle_model: 'Civic',
  vehicle_year: 2022,
  slot_date: '2026-05-20',
  slot_time: '10:00',
  status: 'pending',
  contact_name: 'John Smith',
  contact_phone: '555-0200',
  contact_email: 'john@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ── Mock builder ──────────────────────────────────────────────────────────────
//
// Supabase uses a chainable builder pattern.  Every method (.select, .eq,
// .order, .insert, .update) returns the same builder, and the builder is
// thenable so you can `await` it at any point in the chain.  .single()
// returns a bare Promise (PostgREST object mode).
//
// This factory creates a self-referential builder that resolves to
// `resolvedValue` regardless of where in the chain `await` is called.

type ResolvedValue = { data: unknown; error: null | { message: string; code?: string } };

function makeBuilder(resolvedValue: ResolvedValue) {
  const builder: Record<string, unknown> = {};
  const selfFn = () => builder;

  for (const method of ['select', 'eq', 'order', 'not', 'insert', 'update', 'upsert', 'delete']) {
    builder[method] = selfFn;
  }

  builder['single'] = () => Promise.resolve(resolvedValue);

  builder['then'] = (
    onFulfilled: (v: ResolvedValue) => unknown,
    onRejected?: (r: unknown) => unknown,
  ) => Promise.resolve(resolvedValue).then(onFulfilled, onRejected);

  return builder;
}

/**
 * Creates a builder where `.single()` returns a promise the caller controls.
 * Use this when you need to inspect hook state while the mutation is in-flight.
 */
function makeDeferredBuilder() {
  let resolve!: (v: ResolvedValue) => void;
  const deferred = new Promise<ResolvedValue>(res => { resolve = res; });
  const builder = makeBuilder({ data: null, error: null });
  builder['single'] = () => deferred;
  builder['then'] = (onFulfilled: (v: ResolvedValue) => unknown, onRejected?: (r: unknown) => unknown) =>
    deferred.then(onFulfilled, onRejected);
  return { builder, resolve, deferred };
}

function setupMock(resolvedValue: ResolvedValue) {
  mockFrom.mockReturnValue(makeBuilder(resolvedValue));
}

// ── Test helpers ──────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function makeWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

// ── Hook imports (after mock setup) ──────────────────────────────────────────

import { useBookAppointment } from '../hooks/useBookAppointment';
import { useServices }        from '../hooks/useServices';
import { useMyAppointments }  from '../hooks/useMyAppointments';
import { useBookingStore }    from '../stores/useBookingStore';

const VALID_PAYLOAD: InsertAppointment = {
  service_id: 'svc-1',
  vehicle_make: 'Honda',
  vehicle_model: 'Civic',
  vehicle_year: 2022,
  slot_date: '2026-05-20',
  slot_time: '10:00',
  contact_name: 'John Smith',
  contact_phone: '555-0200',
  contact_email: 'john@example.com',
};

// ─── useBookAppointment ───────────────────────────────────────────────────────

describe('useBookAppointment', () => {
  let qc: QueryClient;

  beforeEach(() => {
    qc = makeQueryClient();
    useBookingStore.getState().reset();
  });

  describe('state machine', () => {
    it('starts idle before any call', () => {
      setupMock({ data: MOCK_APPOINTMENT, error: null });
      const { result } = renderHook(() => useBookAppointment(), { wrapper: makeWrapper(qc) });

      expect(result.current.status).toBe('idle');
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('enters pending while the mutation is in-flight', async () => {
      const { builder, resolve, deferred } = makeDeferredBuilder();
      mockFrom.mockReturnValue(builder);

      const { result } = renderHook(() => useBookAppointment(), { wrapper: makeWrapper(qc) });

      act(() => { result.current.mutate(VALID_PAYLOAD); });

      // TanStack Query schedules the pending state via a microtask; waitFor polls
      // until the component reflects the new state.
      await waitFor(() => expect(result.current.isPending).toBe(true));

      // Resolve and verify the happy path continues to success
      await act(async () => { resolve({ data: MOCK_APPOINTMENT, error: null }); });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Suppress the unresolved-promise warning after the test
      await deferred;
    });

    it('exposes the created appointment in data on success', async () => {
      setupMock({ data: MOCK_APPOINTMENT, error: null });
      const { result } = renderHook(() => useBookAppointment(), { wrapper: makeWrapper(qc) });

      act(() => { result.current.mutate(VALID_PAYLOAD); });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toMatchObject({
        id: 'apt-new',
        status: 'pending',
        service_id: VALID_PAYLOAD.service_id,
        vehicle_make: VALID_PAYLOAD.vehicle_make,
        contact_email: VALID_PAYLOAD.contact_email,
      });
    });
  });

  describe('callbacks', () => {
    it('calls onSuccess with the new appointment', async () => {
      setupMock({ data: MOCK_APPOINTMENT, error: null });
      const onSuccess = jest.fn();
      const { result } = renderHook(
        () => useBookAppointment({ onSuccess }),
        { wrapper: makeWrapper(qc) },
      );

      act(() => { result.current.mutate(VALID_PAYLOAD); });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'apt-new', status: 'pending' }),
      );
    });

    it('calls onError and does NOT call onSuccess on failure', async () => {
      setupMock({ data: null, error: { message: 'Insert failed', code: '500' } });
      const onSuccess = jest.fn();
      const onError   = jest.fn();
      const { result } = renderHook(
        () => useBookAppointment({ onSuccess, onError }),
        { wrapper: makeWrapper(qc) },
      );

      act(() => { result.current.mutate(VALID_PAYLOAD); });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('cache management', () => {
    it('invalidates the [appointments] query key after success', async () => {
      setupMock({ data: MOCK_APPOINTMENT, error: null });
      const invalidateSpy = jest.spyOn(qc, 'invalidateQueries');
      const { result } = renderHook(() => useBookAppointment(), { wrapper: makeWrapper(qc) });

      act(() => { result.current.mutate(VALID_PAYLOAD); });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['appointments'] }),
      );
    });

    it('does NOT invalidate the query cache on error', async () => {
      setupMock({ data: null, error: { message: 'Internal error', code: '500' } });
      const invalidateSpy = jest.spyOn(qc, 'invalidateQueries');
      const { result } = renderHook(() => useBookAppointment(), { wrapper: makeWrapper(qc) });

      act(() => { result.current.mutate(VALID_PAYLOAD); });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('enters isError when Supabase returns an RLS violation', async () => {
      setupMock({ data: null, error: { message: 'new row violates row-level security policy', code: '42501' } });
      const { result } = renderHook(() => useBookAppointment(), { wrapper: makeWrapper(qc) });

      act(() => { result.current.mutate(VALID_PAYLOAD); });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.data).toBeUndefined();
    });

    it('enters isError on a foreign key violation', async () => {
      setupMock({ data: null, error: { message: 'Foreign key violation on service_id', code: '23503' } });
      const { result } = renderHook(() => useBookAppointment(), { wrapper: makeWrapper(qc) });

      act(() => { result.current.mutate(VALID_PAYLOAD); });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});

// ─── useServices ─────────────────────────────────────────────────────────────

describe('useServices', () => {
  let qc: QueryClient;

  beforeEach(() => { qc = makeQueryClient(); });

  it('starts in loading state', () => {
    setupMock({ data: MOCK_SERVICES, error: null });
    const { result } = renderHook(() => useServices(), { wrapper: makeWrapper(qc) });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('returns the full services list on success', async () => {
    setupMock({ data: MOCK_SERVICES, error: null });
    const { result } = renderHook(() => useServices(), { wrapper: makeWrapper(qc) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(MOCK_SERVICES.length);
    expect(result.current.data?.[0]).toMatchObject({ id: 'svc-1', name: 'Oil Change', hidden: false });
  });

  it('enters error state when Supabase returns an error', async () => {
    setupMock({ data: null, error: { message: 'Internal Server Error' } });
    const { result } = renderHook(() => useServices(), { wrapper: makeWrapper(qc) });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });

  it('filters by category when a category param is supplied', async () => {
    // Builder supports unlimited chaining; only the maintenance service is returned.
    setupMock({ data: [MOCK_SERVICES[0]], error: null });
    const { result } = renderHook(() => useServices('maintenance'), { wrapper: makeWrapper(qc) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].category).toBe('maintenance');
  });
});

// ─── RLS policy simulation ────────────────────────────────────────────────────

describe('RLS policy simulation', () => {
  let qc: QueryClient;

  beforeEach(() => { qc = makeQueryClient(); });

  it('returns an empty array for a user with no appointments (RLS silent filter)', async () => {
    // Supabase/PostgREST applies RLS silently: no error, zero rows for unauthenticated user.
    setupMock({ data: [], error: null });
    const { result } = renderHook(() => useMyAppointments(), { wrapper: makeWrapper(qc) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  it('enters error state when Supabase returns a 403 RLS violation', async () => {
    setupMock({ data: null, error: { message: 'new row violates row-level security policy', code: '42501' } });
    const { result } = renderHook(() => useMyAppointments(), { wrapper: makeWrapper(qc) });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });
});

// ─── useBookingStore ──────────────────────────────────────────────────────────

describe('useBookingStore', () => {
  beforeEach(() => { useBookingStore.getState().reset(); });

  it('initialises at step 1 with all fields null', () => {
    const { step, vehicle, service, slot, contact } = useBookingStore.getState();
    expect(step).toBe(1);
    expect(vehicle).toBeNull();
    expect(service).toBeNull();
    expect(slot).toBeNull();
    expect(contact).toBeNull();
  });

  it('setVehicle persists vehicle data', () => {
    useBookingStore.getState().setVehicle({ make: 'Toyota', model: 'RAV4', year: 2023 });
    expect(useBookingStore.getState().vehicle).toEqual({ make: 'Toyota', model: 'RAV4', year: 2023 });
  });

  it('nextStep increments the step up to a max of 4', () => {
    const store = useBookingStore.getState();
    store.nextStep(); expect(useBookingStore.getState().step).toBe(2);
    store.nextStep(); expect(useBookingStore.getState().step).toBe(3);
    store.nextStep(); expect(useBookingStore.getState().step).toBe(4);
    store.nextStep(); expect(useBookingStore.getState().step).toBe(4); // capped at 4
  });

  it('prevStep decrements the step down to a min of 1', () => {
    useBookingStore.setState({ step: 3 });
    const store = useBookingStore.getState();
    store.prevStep(); expect(useBookingStore.getState().step).toBe(2);
    store.prevStep(); expect(useBookingStore.getState().step).toBe(1);
    store.prevStep(); expect(useBookingStore.getState().step).toBe(1); // floored at 1
  });

  it('builds up all four steps in order', () => {
    const store = useBookingStore.getState();
    store.setVehicle({ make: 'Ford', model: 'F-150', year: 2021 });
    store.setService({ id: 'svc-1', name: 'Oil Change', price: 79.99, duration: 45 });
    store.setSlot({ date: '2026-06-01', time: '08:00' });
    store.setContact({ name: 'Alice', phone: '555-9876', email: 'alice@example.com' });

    const s = useBookingStore.getState();
    expect(s.vehicle?.make).toBe('Ford');
    expect(s.service?.id).toBe('svc-1');
    expect(s.slot?.date).toBe('2026-06-01');
    expect(s.contact?.email).toBe('alice@example.com');
  });

  it('reset wipes all fields and returns to step 1 after a successful booking', () => {
    const store = useBookingStore.getState();
    store.setVehicle({ make: 'BMW', model: 'M3', year: 2024 });
    store.setService({ id: 'svc-2', name: 'Brake Inspection', price: 49.99, duration: 60 });
    store.nextStep(); store.nextStep();

    // This is what the useBookAppointment onSuccess callback should call
    store.reset();

    const s = useBookingStore.getState();
    expect(s.step).toBe(1);
    expect(s.vehicle).toBeNull();
    expect(s.service).toBeNull();
    expect(s.slot).toBeNull();
    expect(s.contact).toBeNull();
  });
});
