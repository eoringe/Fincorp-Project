"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Idea } from "@/lib/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

/**
 * Hook to fetch, subscribe to, and sort ideas in real time.
 * - Fetches all ideas on mount
 * - Subscribes to INSERT / UPDATE / DELETE via Supabase Realtime
 * - Returns ideas sorted by upvotes (descending), then by created_at (newest first)
 */
export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Handle realtime events ──
  const handleInsert = useCallback(
    (payload: RealtimePostgresChangesPayload<Idea>) => {
      const newIdea = payload.new as Idea;
      setIdeas((prev) => {
        // Prevent duplicates (in case initial fetch + realtime race)
        if (prev.some((i) => i.id === newIdea.id)) return prev;
        return [newIdea, ...prev];
      });
    },
    []
  );

  const handleUpdate = useCallback(
    (payload: RealtimePostgresChangesPayload<Idea>) => {
      const updated = payload.new as Idea;
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === updated.id ? updated : idea))
      );
    },
    []
  );

  const handleDelete = useCallback(
    (payload: RealtimePostgresChangesPayload<Idea>) => {
      const deleted = payload.old as Partial<Idea>;
      if (deleted.id) {
        setIdeas((prev) => prev.filter((idea) => idea.id !== deleted.id));
      }
    },
    []
  );

  useEffect(() => {
    // ── Fetch initial ideas ──
    async function fetchIdeas() {
      try {
        const { data, error: fetchError } = await supabase
          .from("ideas")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
        } else if (data) {
          setIdeas(data as Idea[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch ideas");
      } finally {
        setLoading(false);
      }
    }

    fetchIdeas();

    // ── Subscribe to realtime changes ──
    const channel = supabase
      .channel("ideas-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ideas" },
        handleInsert
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ideas" },
        handleUpdate
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "ideas" },
        handleDelete
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleInsert, handleUpdate, handleDelete]);

  // ── Sort: most upvoted first, then newest first ──
  const sortedIdeas = [...ideas].sort((a, b) => {
    if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return { ideas: sortedIdeas, loading, error };
}
