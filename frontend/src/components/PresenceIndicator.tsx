"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Users, Radio } from "lucide-react";
import type { PresenceUser } from "@/lib/types";

interface PresenceIndicatorProps {
  activeUsers: PresenceUser[];
  count: number;
  currentUserId: string;
}

/**
 * Modern Presence Badge with glowing radar beacon and audience roster.
 */
export default function PresenceIndicator({
  activeUsers,
  count,
  currentUserId,
}: PresenceIndicatorProps) {
  const [showRoster, setShowRoster] = useState(false);

  // Extract names of others
  const otherUsers = activeUsers.filter((u) => u.user_id !== currentUserId);

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setShowRoster((prev) => !prev)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all duration-150 cursor-pointer"
        aria-label="Toggle active audience list"
      >
        {/* Pulsing radar dot */}
        <div className="relative flex items-center justify-center w-2.5 h-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success shadow-xs shadow-success" />
        </div>

        {/* Count & Label */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5 text-muted" />
          <motion.span
            key={count}
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-semibold text-foreground tabular-nums"
          >
            {count}
          </motion.span>
          <span className="hidden sm:inline text-muted">online</span>
        </div>
      </motion.button>

      {/* Dropdown Roster of Active Participants */}
      <AnimatePresence>
        {showRoster && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 p-3 rounded-2xl glass-card border border-white/[0.1] shadow-2xl z-50 text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-2 text-muted">
              <span className="font-medium text-foreground">Room Audience</span>
              <span className="text-[10px] text-success flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> Live
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 py-1 px-1.5 rounded-lg bg-primary/10 text-primary">
                <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center text-[10px] font-bold">
                  You
                </div>
                <span className="truncate font-medium">You (Current session)</span>
              </div>

              {otherUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center gap-2 py-1 px-1.5 rounded-lg text-foreground/80 hover:bg-white/[0.04]"
                >
                  <div className="w-5 h-5 rounded-full bg-white/[0.1] flex items-center justify-center text-[10px] text-muted-foreground uppercase font-semibold">
                    {(user.display_name || "A").slice(0, 1)}
                  </div>
                  <span className="truncate">
                    {user.display_name || "Anonymous Member"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

