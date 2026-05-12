// Centralises env-var access so tests can swap this module via moduleNameMapper
// without touching import.meta.env anywhere else.
export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  SUPABASE_SERVICE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string,
};
