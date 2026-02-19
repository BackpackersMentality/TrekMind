import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Types derived from the schema exports in shared/routes
type TrekListResponse = z.infer<typeof api.treks.list.responses[200]>;
type TrekDetailResponse = z.infer<typeof api.treks.get.responses[200]>;

export function useTreks() {
  return useQuery({
    queryKey: [api.treks.list.path],
    queryFn: async () => {
      const res = await fetch(api.treks.list.path);
      if (!res.ok) throw new Error("Failed to fetch treks");
      return api.treks.list.responses[200].parse(await res.json());
    },
  });
}

export function useTrek(id: number) {
  return useQuery({
    queryKey: [api.treks.get.path, id],
    queryFn: async () => {
      // Use helper to replace :id in path
      const url = buildUrl(api.treks.get.path, { id });
      const res = await fetch(url);
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch trek details");
      
      return api.treks.get.responses[200].parse(await res.json());
    },
    enabled: !!id, // Only run if ID is valid
  });
}
