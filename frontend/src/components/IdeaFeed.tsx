"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Loader2 } from "lucide-react";
import IdeaCard from "./IdeaCard";
import type { Idea } from "@/lib/types";

interface IdeaFeedProps {
  ideas: Idea[];
  loading: boolean;
  error: string | null;
}

/**
 * Live feed of ideas with AnimatePresence for smooth enter/exit animations.
 * Shows loading skeleton, empty state, or the list of idea cards.
 */
export default function IdeaFeed({ ideas, loading, error }: IdeaFeedProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted text-sm">Loading ideas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-red-400 text-sm">⚠ {error}</p>
        <p className="text-muted text-xs">Check your Supabase configuration</p>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 gap-4"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Lightbulb className="w-12 h-12 text-primary/40" />
        </motion.div>
        <div className="text-center">
          <p className="text-muted-foreground text-base font-medium">
            No ideas yet
          </p>
          <p className="text-muted text-sm mt-1">
            Be the first to share a brilliant idea! ✨
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1 mb-1">
        <h2 className="text-sm font-medium text-muted-foreground">
          {ideas.length} {ideas.length === 1 ? "idea" : "ideas"} shared
        </h2>
        <span className="text-xs text-muted">Sorted by most upvoted</span>
      </div>

      <AnimatePresence mode="popLayout">
        {ideas.map((idea, index) => (
          <IdeaCard key={idea.id} idea={idea} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
}
