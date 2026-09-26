"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronUp, Clock, Copy, Check, Trophy, CheckCheck } from "lucide-react";
import type { Idea } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

const FLASK_API = process.env.NEXT_PUBLIC_FLASK_API_URL;
const STORAGE_KEY = "fincorp_upvoted_ideas";

/** Returns the Set of idea IDs this browser has already upvoted. */
function getUpvotedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Persists a newly-voted idea ID to localStorage. */
function markUpvoted(ideaId: string): void {
  try {
    const upvoted = getUpvotedSet();
    upvoted.add(ideaId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...upvoted]));
  } catch {
    // localStorage may be unavailable (private browsing, storage quota)
  }
}

interface IdeaCardProps {
  idea: Idea;
  index: number;
}

/**
 * Modern Idea Card with rank badges, spring physics upvoting,
 * copy-to-clipboard, and relative timestamps.
 * Upvotes are deduplicated per browser via localStorage.
 */
export default function IdeaCard({ idea, index }: IdeaCardProps) {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(() => getUpvotedSet().has(idea.id));
  const [copied, setCopied] = useState(false);

  const handleUpvote = useCallback(async () => {
    if (isUpvoting || hasVoted) return;
    setIsUpvoting(true);

    try {
      const res = await fetch(`${FLASK_API}/api/ideas/${idea.id}/upvote`, {
        method: "POST",
      });
      if (res.ok) {
        markUpvoted(idea.id);
        setHasVoted(true);
      }
    } catch {
      // Silently fail — realtime will handle the actual count
    } finally {
      setIsUpvoting(false);
    }
  }, [isUpvoting, hasVoted, idea.id]);

  function handleCopy() {
    navigator.clipboard.writeText(idea.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isTop1 = index === 0 && idea.upvotes > 0;
  const isTop2 = index === 1 && idea.upvotes > 0;
  const isTop3 = index === 2 && idea.upvotes > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 28,
        layout: { duration: 0.25 },
      }}
      className={`group relative flex gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-all duration-300 ${
        isTop1
          ? "top-idea-glow"
          : "glass-card-interactive"
      }`}
    >
      {/* Upvote Section */}
      <div className="flex flex-col items-center shrink-0">
        <motion.button
          id={`upvote-${idea.id}`}
          onClick={handleUpvote}
          disabled={isUpvoting || hasVoted}
          whileHover={hasVoted ? {} : { scale: 1.08 }}
          whileTap={hasVoted ? {} : { scale: 0.92 }}
          className={`relative flex flex-col items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg transition-all duration-200 ${
            hasVoted
              ? "bg-teal-500/15 text-teal-600 border border-teal-500/30 cursor-not-allowed"
              : isTop1
              ? "bg-primary/15 text-primary border border-primary/30 shadow-xs shadow-primary-glow hover:bg-primary/25 cursor-pointer"
              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-primary/10 hover:text-primary hover:border-primary/30 cursor-pointer"
          } disabled:opacity-70`}
          aria-label={
            hasVoted ? "Already upvoted" : `Upvote idea: ${idea.text}`
          }
          title={hasVoted ? "You already upvoted this idea" : "Upvote"}
        >
          {hasVoted ? (
            <CheckCheck className="w-3.5 h-3.5 -mb-0.5 text-teal-500" />
          ) : (
            <ChevronUp className="w-4 h-4 -mb-0.5" />
          )}
          <motion.span
            key={idea.upvotes}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className={`text-[11px] font-bold tabular-nums leading-none ${
              hasVoted ? "text-teal-600" : isTop1 ? "text-primary" : "text-foreground"
            }`}
          >
            {idea.upvotes}
          </motion.span>
        </motion.button>

        {/* Small rank label below upvote */}
        <span className="text-[9px] font-mono text-muted/60 mt-0.5">
          #{index + 1}
        </span>
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Header pill tags */}
          {(isTop1 || isTop2 || isTop3) && (
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              {isTop1 && (
                <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                  <Trophy className="w-2.5 h-2.5 text-amber-600" />
                  TOP IDEA
                </span>
              )}
              {isTop2 && (
                <span className="inline-flex items-center gap-1 bg-slate-200/80 border border-slate-300 text-slate-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                  #2 TRENDING
                </span>
              )}
              {isTop3 && (
                <span className="inline-flex items-center gap-1 bg-amber-600/15 border border-amber-600/30 text-amber-800 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                  #3 TRENDING
                </span>
              )}
            </div>
          )}

          <p className="text-foreground/95 text-xs sm:text-[13px] leading-snug break-words font-normal line-clamp-2">
            {idea.text}
          </p>
        </div>

        {/* Footer info row */}
        <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-slate-100/80">
          <div className="flex items-center gap-1 text-muted text-[11px]">
            <Clock className="w-3 h-3 text-muted/70" />
            <span>{timeAgo(idea.created_at)}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] text-muted hover:text-foreground opacity-70 group-hover:opacity-100 transition-all duration-150 px-1.5 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
            title="Copy idea text"
          >
            {copied ? (
              <>
                <Check className="w-2.5 h-2.5 text-success" />
                <span className="text-success font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-2.5 h-2.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

