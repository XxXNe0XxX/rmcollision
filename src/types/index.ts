// ─── Domain types (mirror the Supabase schema) ───────────────────────────────

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in-bay'
  | 'complete'
  | 'cancelled';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Estimated duration in minutes */
  duration: number;
  category: string;
  hidden: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  service_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_vin?: string;
  slot_date: string;
  slot_time: string;
  status: AppointmentStatus;
  notes?: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
  /** Populated via PostgREST join: ?select=*,service:services(*) */
  service?: Service;
}

// ─── Mutation payloads ────────────────────────────────────────────────────────

export interface InsertAppointment {
  service_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_vin?: string;
  slot_date: string;
  slot_time: string;
  notes?: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

export interface UpdateAppointmentStatus {
  id: string;
  status: AppointmentStatus;
}

// ─── Booking store steps ──────────────────────────────────────────────────────

export interface VehicleStep {
  make: string;
  model: string;
  year: number;
  vin?: string;
}

export interface ServiceStep {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface SlotStep {
  date: string;
  time: string;
}

export interface ContactStep {
  name: string;
  phone: string;
  email: string;
  notes?: string;
}
