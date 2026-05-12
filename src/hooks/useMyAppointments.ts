import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { Appointment } from '@/types';

async function fetchMyAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, service:services(*)')
    .order('slot_date', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Fetches the authenticated user's appointments.
 * RLS on the Supabase side ensures auth.uid() == user_id.
 */
export function useMyAppointments() {
  return useQuery({
    queryKey: ['appointments', 'mine'] as const,
    queryFn: fetchMyAppointments,
    staleTime: 30 * 1000,
  });
}
