"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
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
 * Main page — Live Collaborative Idea Board
 * Composes the idea form, live feed, presence indicator, and display name editor.
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

  // Handle display name change
  function handleNameChange(name: string) {
    setDisplayName(name);
    saveDisplayName(name);
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Idea Board
            </h1>
          </motion.div>

          <div className="flex items-center gap-3">
            <DisplayNameEditor
              currentName={displayName}
              onSave={handleNameChange}
            />
            <div className="hidden sm:block w-px h-5 bg-border" />
            <PresenceIndicator
              activeUsers={activeUsers}
              count={count}
              currentUserId={userId}
            />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
        {/* Idea Submission */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <h2 className="text-xl font-semibold text-foreground">
              Share an Idea
            </h2>
            <p className="text-sm text-muted mt-1">
              Submit your ideas or questions for the hackathon presenters
            </p>
          </motion.div>
          <IdeaForm />
        </section>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-xs text-muted uppercase tracking-widest">
              Live Feed
            </span>
          </div>
        </div>

        {/* Live Feed */}
        <section>
          <IdeaFeed ideas={ideas} loading={loading} error={error} />
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-4">
        <p className="text-center text-xs text-muted">
          Built for the Hackathon &mdash; Real-time updates powered by Supabase
        </p>
      </footer>
    </div>
  );
}
