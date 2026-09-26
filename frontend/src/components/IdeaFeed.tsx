"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Lightbulb,
  Loader2,
  Search,
  X,
  Flame,
  Clock,
  ArrowUp,
  Sparkles,
} from "lucide-react";
import IdeaCard from "./IdeaCard";
import type { Idea } from "@/lib/types";

interface IdeaFeedProps {
  ideas: Idea[];
  loading: boolean;
  error: string | null;
}

type FilterType = "trending" | "newest" | "unvoted";

/**
 * Live Feed of ideas with overflow control, real-time search,
 * sorting tabs, and scroll management.
 */
export default function IdeaFeed({ ideas, loading, error }: IdeaFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("trending");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter & Search ideas
  const filteredIdeas = useMemo(() => {
    let result = [...ideas];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((idea) => idea.text.toLowerCase().includes(q));
    }

    // Tab filter/sort
    if (activeFilter === "trending") {
      result.sort((a, b) => {
        if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    } else if (activeFilter === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (activeFilter === "unvoted") {
      result = result
        .filter((idea) => idea.upvotes === 0)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return result;
  }, [ideas, searchQuery, activeFilter]);

  // Track scroll position to show "Back to top" button
  function handleScroll() {
    if (!scrollContainerRef.current) return;
    setShowScrollTop(scrollContainerRef.current.scrollTop > 240);
  }

  function scrollToTop() {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl glass-card">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted text-sm">Connecting to live feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-center px-4">
        <p className="text-red-400 text-sm font-medium">{error}</p>
        <p className="text-muted text-xs">Verify your Supabase configuration</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* ── Feed Control Toolbar (Search & Tabs) ── */}
      <div className="shrink-0 mb-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveFilter("trending")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                activeFilter === "trending"
                  ? "bg-primary text-white shadow-xs shadow-primary-glow"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => setActiveFilter("newest")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                activeFilter === "newest"
                  ? "bg-primary text-white shadow-xs shadow-primary-glow"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Newest</span>
            </button>

            <button
              onClick={() => setActiveFilter("unvoted")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                activeFilter === "unvoted"
                  ? "bg-primary text-white shadow-xs shadow-primary-glow"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Needs Love</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-[220px]">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted/70 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-muted px-1">
          <span>
            Showing{" "}
            <strong className="text-foreground font-semibold">
              {filteredIdeas.length}
            </strong>{" "}
            of {ideas.length} {ideas.length === 1 ? "idea" : "ideas"}
          </span>
          {searchQuery && (
            <span className="text-primary text-[11px]">
              Filtered by &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* ── Controlled Overflow Scroll Container ── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 space-y-3 pb-8 max-h-[calc(100vh-270px)] sm:max-h-[calc(100vh-250px)] lg:max-h-[calc(100vh-220px)]"
      >
        {ideas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl glass-card text-center px-4"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Lightbulb className="w-12 h-12 text-primary/40" />
            </motion.div>
            <div>
              <p className="text-foreground text-base font-semibold">
                No ideas shared yet
              </p>
              <p className="text-muted text-xs mt-1 max-w-xs">
                Be the first to propose an idea or question for the hackathon presenters!
              </p>
            </div>
          </motion.div>
        ) : filteredIdeas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl bg-slate-50 border border-slate-200 text-center px-4">
            <Search className="w-8 h-8 text-muted/40" />
            <p className="text-foreground text-sm font-medium">
              No matching ideas found
            </p>
            <p className="text-muted text-xs">
              Try adjusting your search query or switching tabs
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-primary hover:underline cursor-pointer mt-1"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredIdeas.map((idea, index) => (
              <IdeaCard key={idea.id} idea={idea} index={index} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Floating Scroll-to-Top Button ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={scrollToTop}
            className="absolute bottom-3 right-3 z-30 p-2.5 rounded-full bg-primary text-white shadow-lg shadow-primary-glow hover:bg-primary-hover transition-colors cursor-pointer"
            aria-label="Scroll to top of idea feed"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

