"use client";

import { motion } from "framer-motion";
import { Eye, Users } from "lucide-react";
import type { PresenceUser } from "@/lib/types";
import { formatPresenceText } from "@/lib/utils";

interface PresenceIndicatorProps {
  activeUsers: PresenceUser[];
  count: number;
  currentUserId: string;
}

/**
 * Displays the number of active users and their display names.
 * Features a pulsing green dot and smooth count transitions.
 */
export default function PresenceIndicator({
  activeUsers,
  count,
  currentUserId,
}: PresenceIndicatorProps) {
  // Get display names of OTHER users (not self)
  const otherUsers = activeUsers.filter((u) => u.user_id !== currentUserId);
  const otherNames = otherUsers.map((u) => u.display_name).filter(Boolean);

  const presenceText = formatPresenceText(otherNames, otherUsers.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-card border border-border rounded-full px-4 py-2"
    >
      {/* Live dot */}
      <div className="relative flex items-center">
        <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-success opacity-75 animate-ping" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
      </div>

      {/* User count */}
      <div className="flex items-center gap-1.5">
        {count > 1 ? (
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
        )}
        <motion.span
          key={count}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          <span className="font-semibold text-foreground">{count}</span>
          {" "}online
        </motion.span>
      </div>

      {/* Names tooltip (visible on larger screens) */}
      {otherUsers.length > 0 && (
        <span className="hidden sm:inline text-xs text-muted border-l border-border pl-3 max-w-[200px] truncate">
          {presenceText}
        </span>
      )}
    </motion.div>
  );
}
