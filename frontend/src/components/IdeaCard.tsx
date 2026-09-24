"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, Clock } from "lucide-react";
import type { Idea } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

const FLASK_API = process.env.NEXT_PUBLIC_FLASK_API_URL;

interface IdeaCardProps {
  idea: Idea;
  index: number;
}

/**
 * Individual idea card with upvote button, animated count, and time ago.
 * Upvotes are sent to Flask backend which atomically increments in Supabase.
 */
export default function IdeaCard({ idea, index }: IdeaCardProps) {
  const [isUpvoting, setIsUpvoting] = useState(false);

  async function handleUpvote() {
    if (isUpvoting) return;
    setIsUpvoting(true);

    try {
      await fetch(`${FLASK_API}/api/ideas/${idea.id}/upvote`, {
        method: "POST",
      });
    } catch {
      // Silently fail — the realtime update won't come through
    } finally {
      setIsUpvoting(false);
    }
  }

  const isTopIdea = index === 0 && idea.upvotes > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
        layout: { duration: 0.3 },
      }}
      className={`group relative flex gap-4 p-4 rounded-xl border transition-all duration-300 ${
        isTopIdea
          ? "bg-gradient-to-r from-primary/10 to-accent/5 border-primary/30 shadow-lg shadow-primary-glow"
          : "bg-card border-border hover:border-border-hover hover:bg-card-hover"
      }`}
    >
      {/* Upvote section */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <motion.button
          id={`upvote-${idea.id}`}
          onClick={handleUpvote}
          disabled={isUpvoting}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
            isTopIdea
              ? "bg-primary/20 text-primary hover:bg-primary/30"
              : "bg-secondary text-muted-foreground hover:bg-primary/15 hover:text-primary"
          } disabled:opacity-50`}
          aria-label={`Upvote idea: ${idea.text}`}
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>

        <motion.span
          key={idea.upvotes}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={`text-sm font-bold tabular-nums ${
            isTopIdea ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {idea.upvotes}
        </motion.span>
      </div>

      {/* Content section */}
      <div className="flex-1 min-w-0">
        <p className="text-foreground text-[15px] leading-relaxed break-words">
          {idea.text}
        </p>
        <div className="flex items-center gap-1.5 mt-2.5">
          <Clock className="w-3 h-3 text-muted" />
          <span className="text-xs text-muted">{timeAgo(idea.created_at)}</span>
        </div>
      </div>

      {/* Top idea badge */}
      {isTopIdea && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-primary-glow"
        >
          🔥 TOP
        </motion.div>
      )}
    </motion.div>
  );
}
