import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabaseClient';
import type { Appointment, UpdateAppointmentStatus } from '@/types';

async function updateStatus({ id, status }: UpdateAppointmentStatus): Promise<Appointment> {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, service:services(*)')
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Appointment not found');
  return data;
}

const ADMIN_KEY = ['appointments', 'admin'] as const;

/**
 * Updates an appointment's status with optimistic UI:
 * the list updates instantly while the PATCH is in-flight, and
 * rolls back automatically if the server rejects the change.
 */
export function useUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStatus,

    // 1. Snapshot and apply optimistic patch
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_KEY });
      const previousAppointments = queryClient.getQueryData<Appointment[]>(ADMIN_KEY);

      queryClient.setQueryData<Appointment[]>(ADMIN_KEY, (old) =>
        old?.map((a) => (a.id === id ? { ...a, status } : a)) ?? [],
      );

      return { previousAppointments };
    },

    // 2. Roll back on failure
    onError: (_err, _vars, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(ADMIN_KEY, context.previousAppointments);
      }
    },

    // 3. Always re-sync with server truth
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
