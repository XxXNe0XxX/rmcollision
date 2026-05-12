import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Service } from "@/types";

async function fetchServices(category?: string): Promise<Service[]> {
  console.log("[useServices] fetching from database…", { category });

  let query = supabase
    .from("services")
    .select("*")
    // .eq("hidden", false)
    .order("name");

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[useServices] fetch failed:", error.message);
    throw new Error(error.message);
  }

  console.log("[useServices] received", data?.length ?? 0, "services");
  return data ?? [];
}

/**
 * Fetches visible services, optionally filtered by category.
 * Cached for 5 minutes — services change infrequently.
 */
export function useServices(category?: string) {
  return useQuery({
    queryKey: ["services", { category }] as const,
    queryFn: () => fetchServices(category),
    staleTime: 5 * 60 * 1000,
  });
}
