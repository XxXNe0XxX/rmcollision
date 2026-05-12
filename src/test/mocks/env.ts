// Replaces src/lib/env.ts in the Jest environment via moduleNameMapper.
// Uses the same URL that MSW handlers listen on.
export const env = {
  SUPABASE_URL: 'http://localhost:54321',
  SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_KEY: 'test-service-key',
};
