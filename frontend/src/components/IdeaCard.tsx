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
      className={`group relative flex gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl transition-all duration-300 ${
        isTop1
          ? "top-idea-glow"
          : "glass-card-interactive"
      }`}
    >
      {/* Upvote Section */}
      <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
        <motion.button
          id={`upvote-${idea.id}`}
          onClick={handleUpvote}
          disabled={isUpvoting || hasVoted}
          whileHover={hasVoted ? {} : { scale: 1.12 }}
          whileTap={hasVoted ? {} : { scale: 0.88 }}
          className={`relative flex flex-col items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all duration-200 ${
            hasVoted
              ? "bg-teal-500/15 text-teal-400 border border-teal-500/30 cursor-not-allowed"
              : isTop1
              ? "bg-primary/25 text-primary border border-primary/40 shadow-md shadow-primary-glow hover:bg-primary/35 cursor-pointer"
              : "bg-white/[0.04] text-muted-foreground border border-white/[0.06] hover:bg-primary/20 hover:text-primary hover:border-primary/30 cursor-pointer"
          } disabled:opacity-70`}
          aria-label={
            hasVoted ? "Already upvoted" : `Upvote idea: ${idea.text}`
          }
          title={hasVoted ? "You already upvoted this idea" : "Upvote"}
        >
          {hasVoted ? (
            <CheckCheck className="w-5 h-5 -mb-0.5 text-teal-400" />
          ) : (
            <ChevronUp className="w-5 h-5 -mb-0.5" />
          )}
          <motion.span
            key={idea.upvotes}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className={`text-xs font-bold tabular-nums ${
              hasVoted ? "text-teal-400" : isTop1 ? "text-primary" : "text-foreground"
            }`}
          >
            {idea.upvotes}
          </motion.span>
        </motion.button>

        {/* Small rank label below upvote */}
        <span className="text-[10px] font-mono text-muted/70 tracking-wider">
          #{index + 1}
        </span>
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Header pill tags */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {isTop1 && (
              <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                <Trophy className="w-3 h-3 text-amber-400" />
                TOP IDEA
              </span>
            )}
            {isTop2 && (
              <span className="inline-flex items-center gap-1 bg-slate-400/15 border border-slate-400/30 text-slate-300 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                #2 TRENDING
              </span>
            )}
            {isTop3 && (
              <span className="inline-flex items-center gap-1 bg-amber-700/20 border border-amber-700/30 text-amber-400 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                #3 TRENDING
              </span>
            )}
          </div>

          <p className="text-foreground/95 text-[15px] sm:text-base leading-relaxed break-words font-normal">
            {idea.text}
          </p>
        </div>

        {/* Footer info row */}
        <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-muted text-xs">
            <Clock className="w-3.5 h-3.5 text-muted/70" />
            <span>{timeAgo(idea.created_at)}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-muted hover:text-foreground opacity-60 group-hover:opacity-100 transition-all duration-150 px-2 py-1 rounded-md hover:bg-white/[0.05]"
            title="Copy idea text"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-success" />
                <span className="text-success font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

