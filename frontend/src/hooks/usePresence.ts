"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { PresenceUser } from "@/lib/types";

/**
 * Hook to track active users via Supabase Presence.
 * - Joins a shared presence channel
 * - Broadcasts user_id and display_name
 * - Returns all active users and total count
 * - Re-tracks when display name changes
 */
export function usePresence(userId: string, displayName: string) {
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel("idea-board-presence", {
      config: {
        presence: { key: userId },
      },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        const users: PresenceUser[] = [];

        for (const key of Object.keys(state)) {
          const presences = state[key];
          if (presences && presences.length > 0) {
            users.push({
              user_id: presences[0].user_id,
              display_name: presences[0].display_name,
            });
          }
        }

        setActiveUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userId,
            display_name: displayName,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId, displayName]);

  return {
    activeUsers,
    count: activeUsers.length,
  };
}
