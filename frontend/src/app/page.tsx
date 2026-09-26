"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Flame,
  MessageSquare,
  Users,
  Radio,
  Zap,
  HelpCircle,
} from "lucide-react";
import IdeaForm from "@/components/IdeaForm";
import IdeaFeed from "@/components/IdeaFeed";
import PresenceIndicator from "@/components/PresenceIndicator";
import DisplayNameEditor from "@/components/DisplayNameEditor";
import { useIdeas } from "@/hooks/useIdeas";
import { usePresence } from "@/hooks/usePresence";
import {
  getOrCreateUserId,
  getDisplayName,
  setDisplayName as saveDisplayName,
} from "@/lib/utils";

/**
 * Main Page — Revamped Live Collaborative Idea Board
 * Features a modern two-column dashboard layout, sticky composer,
 * controlled-overflow real-time feed, room stats, and presence tracking.
 */
export default function Home() {
  const [userId, setUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mounted, setMounted] = useState(false);

  // Initialize user identity from localStorage
  useEffect(() => {
    setUserId(getOrCreateUserId());
    setDisplayName(getDisplayName());
    setMounted(true);
  }, []);

  // Real-time hooks
  const { ideas, loading, error } = useIdeas();
  const { activeUsers, count } = usePresence(userId, displayName);

  // Computed stats
  const totalUpvotes = ideas.reduce((acc, idea) => acc + (idea.upvotes || 0), 0);

  function handleNameChange(name: string) {
    setDisplayName(name);
    saveDisplayName(name);
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-xs font-mono">Initializing live session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary-hover lg:overflow-hidden">
      {/* ── Top Navigation Bar ── */}
      <header className="shrink-0 h-14 z-50 glass-header border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Live Status */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 sm:gap-2.5 min-w-0"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary via-primary-hover to-accent flex items-center justify-center shadow-md shadow-primary-glow/50 shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold tracking-tight bg-gradient-to-r from-primary via-primary-hover to-accent bg-clip-text text-transparent truncate">
                  Idea Board
                </h1>
                <p className="text-[10px] text-muted -mt-0.5 hidden sm:block">
                  Live Hackathon Collaborative Stream
                </p>
              </div>
            </motion.div>

            {/* Live broadcast pill */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-semibold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              STAGE LIVE
            </span>
          </div>

          {/* User Controls: Display Name + Presence */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <DisplayNameEditor
              currentName={displayName}
              onSave={handleNameChange}
            />
            <div className="w-px h-4 bg-slate-300" />
            <PresenceIndicator
              activeUsers={activeUsers}
              count={count}
              currentUserId={userId}
            />
          </div>
        </div>
      </header>

      {/* ── Main Dashboard Workspace ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex flex-col lg:min-h-0 lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 lg:h-full lg:min-h-0 items-stretch">
          {/* ══════════════════════════════════════════════════════
              LEFT COLUMN: Live Audience Data & Submission (col 1-5)
             ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-3.5 lg:h-full lg:min-h-0">
            {/* Live Session Summary Banner (Live Audience Data) */}
            <div className="p-3.5 sm:p-4 rounded-2xl glass-card relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-primary tracking-wider uppercase flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
                  Live Audience Q&A
                </span>
                <span className="text-xs text-muted flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Realtime sync
                </span>
              </div>

              <h2 className="text-base font-bold tracking-tight text-foreground">
                Pitch an idea or ask questions
              </h2>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">
                Submit questions and ideas. Audience members can upvote topics to the top in real time!
              </p>

              {/* Room Quick Stats Strip */}
              <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2.5 border-t border-slate-200">
                <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted mb-0.5">
                    <MessageSquare className="w-3 h-3" />
                    <span>Ideas</span>
                  </div>
                  <span className="text-xs font-bold text-foreground tabular-nums">
                    {ideas.length}
                  </span>
                </div>

                <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted mb-0.5">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>Upvotes</span>
                  </div>
                  <span className="text-xs font-bold text-foreground tabular-nums">
                    {totalUpvotes}
                  </span>
                </div>

                <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted mb-0.5">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <span>Viewers</span>
                  </div>
                  <span className="text-xs font-bold text-foreground tabular-nums">
                    {count}
                  </span>
                </div>
              </div>
            </div>

            {/* Idea Composer Card (Create Submission) */}
            <div className="p-3.5 sm:p-4 rounded-2xl glass-card flex flex-col lg:flex-1 lg:min-h-0">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Create Submission
                </h3>
                <span className="text-[10px] text-muted">200 chars max</span>
              </div>
              <IdeaForm />
            </div>

            {/* Quick Tips Box */}
            <div className="hidden sm:flex items-start gap-2 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-muted shrink-0">
              <HelpCircle className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5" />
              <span>
                <strong>Pro tip:</strong> Ideas with the most upvotes automatically rise to the top of the feed for everyone to see.
              </span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              RIGHT COLUMN: Controlled Overflow Live Feed (col 6-12)
             ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 flex flex-col lg:h-full lg:min-h-0 min-h-[460px]">
            <div className="p-3.5 sm:p-4 rounded-2xl glass-card flex flex-col lg:h-full lg:min-h-0 min-h-[460px]">
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold tracking-tight text-foreground">
                    Live Feed
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary/20 text-primary border border-primary/30">
                    Live Updates
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span>Sub-100ms sync</span>
                </div>
              </div>

              {/* Feed with internal overflow handling */}
              <IdeaFeed ideas={ideas} loading={loading} error={error} />
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="shrink-0 border-t border-slate-200/80 py-2.5 sm:py-2 bg-white/60 text-center text-xs text-muted mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span className="text-[11px] sm:text-xs">Hackathon Collaborative Board &mdash; Powered by Supabase Realtime &amp; Flask</span>
          <span className="text-[10px] sm:text-[11px] text-muted/60">Atomic upvoting &bull; PostgreSQL Logical Replication</span>
        </div>
      </footer>
    </div>
  );
}

