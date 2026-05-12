import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  VehicleStep,
  ServiceStep,
  SlotStep,
  ContactStep,
} from '@/types';

// Step 1 → Vehicle, 2 → Service, 3 → Slot, 4 → Contact
export type BookingStep = 1 | 2 | 3 | 4;

interface BookingState {
  step: BookingStep;
  vehicle: VehicleStep | null;
  service: ServiceStep | null;
  slot: SlotStep | null;
  contact: ContactStep | null;

  // ── Actions ──────────────────────────────────────────────────────────────
  setStep: (step: BookingStep) => void;
  setVehicle: (vehicle: VehicleStep) => void;
  setService: (service: ServiceStep) => void;
  setSlot: (slot: SlotStep) => void;
  setContact: (contact: ContactStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  /** Call after a successful useBookAppointment mutation to wipe the form. */
  reset: () => void;
}

const INITIAL_STATE = {
  step: 1 as BookingStep,
  vehicle: null,
  service: null,
  slot: null,
  contact: null,
};

export const useBookingStore = create<BookingState>()(
  devtools(
    (set, get) => ({
      ...INITIAL_STATE,

      setStep: (step) =>
        set({ step }, false, 'booking/setStep'),

      setVehicle: (vehicle) =>
        set({ vehicle }, false, 'booking/setVehicle'),

      setService: (service) =>
        set({ service }, false, 'booking/setService'),

      setSlot: (slot) =>
        set({ slot }, false, 'booking/setSlot'),

      setContact: (contact) =>
        set({ contact }, false, 'booking/setContact'),

      nextStep: () => {
        const { step } = get();
        if (step < 4) set({ step: (step + 1) as BookingStep }, false, 'booking/nextStep');
      },

      prevStep: () => {
        const { step } = get();
        if (step > 1) set({ step: (step - 1) as BookingStep }, false, 'booking/prevStep');
      },

      reset: () => set(INITIAL_STATE, false, 'booking/reset'),
    }),
    { name: 'booking-store' },
  ),
);
