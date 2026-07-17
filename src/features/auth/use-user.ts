"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useUser() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);

  const query = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    });
    setReady(true);
    return () => subscription.unsubscribe();
  }, [supabase, queryClient]);

  return { user: query.data ?? null, isLoading: !ready || query.isLoading };
}
