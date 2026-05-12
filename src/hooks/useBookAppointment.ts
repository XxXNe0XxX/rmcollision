import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { Appointment, InsertAppointment } from '@/types';

async function bookAppointment(payload: InsertAppointment): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert(payload)
    .select('*, service:services(*)')
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('No data returned from insert');
  return data;
}

interface Options {
  onSuccess?: (appointment: Appointment) => void;
  onError?: (error: Error) => void;
}

/**
 * Inserts a new appointment row.
 * On success: invalidates the appointments cache and calls onSuccess.
 */
export function useBookAppointment(options?: Options) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookAppointment,
    onSuccess: (appointment) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      options?.onSuccess?.(appointment);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
