import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabaseClient';
import type { Appointment } from '@/types';

async function fetchAllAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('*, service:services(*)')
    .order('slot_date', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Fetches every appointment using the service_role client (bypasses RLS).
 * Must only be rendered inside a protected admin route.
 */
export function useAdminAppointments() {
  return useQuery({
    queryKey: ['appointments', 'admin'] as const,
    queryFn: fetchAllAppointments,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}
