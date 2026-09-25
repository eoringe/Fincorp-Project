"use client";

import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, CornerDownLeft, AlertCircle } from "lucide-react";

const FLASK_API = process.env.NEXT_PUBLIC_FLASK_API_URL;

const PROMPT_CHIPS = [
  { label: "Idea", prefix: "[Idea] " },
  { label: "Question", prefix: "[Question] " },
  { label: "Feature", prefix: "[Feature] " },
  { label: "Feedback", prefix: "[Feedback] " },
];

/**
 * Modern Idea Submission Form with interactive starter chips,
 * Cmd/Ctrl+Enter submission, and character tracking.
 */
export default function IdeaForm() {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = text.length;
  const maxChars = 200;
  const isNearLimit = charCount > 160;
  const isOverLimit = charCount > maxChars;
  const progressPercent = Math.min((charCount / maxChars) * 100, 100);

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSubmitting || isOverLimit) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${FLASK_API}/api/ideas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit idea");
      }

      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Cmd+Enter or Ctrl+Enter submits
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  function applyChip(prefix: string) {
    if (!text.startsWith(prefix)) {
      setText((prev) => {
        // Remove any existing chip prefix first
        let cleaned = prev;
        for (const chip of PROMPT_CHIPS) {
          if (cleaned.startsWith(chip.prefix)) {
            cleaned = cleaned.slice(chip.prefix.length);
            break;
          }
        }
        return prefix + cleaned;
      });
    }
    textareaRef.current?.focus();
  }

  return (
    <div className="w-full">
      {/* Starter Chips */}
      <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] font-medium text-muted uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" />
          Tag:
        </span>
        {PROMPT_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => applyChip(chip.prefix)}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-primary/20 hover:text-primary border border-white/[0.06] hover:border-primary/30 text-muted-foreground transition-all duration-150 shrink-0 cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative rounded-2xl bg-card border border-border group-focus-within:border-primary/50 group-focus-within:shadow-lg group-focus-within:shadow-primary-glow/20 transition-all duration-300 overflow-hidden">
          <textarea
            ref={textareaRef}
            id="idea-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share an idea, question, or feature proposal..."
            rows={3}
            className="w-full bg-transparent p-4 pb-14 text-foreground placeholder:text-muted/70 resize-none focus:outline-none text-[15px] leading-relaxed"
          />

          {/* Bottom Toolbar inside textarea box */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3.5 py-2.5 bg-black/20 border-t border-white/[0.04] backdrop-blur-xs">
            <div className="flex items-center gap-2">
              {/* Progress mini bar */}
              <div className="w-12 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${
                    isOverLimit
                      ? "bg-red-500"
                      : isNearLimit
                      ? "bg-amber-400"
                      : "bg-primary"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span
                className={`text-[11px] font-mono tabular-nums transition-colors ${
                  isOverLimit
                    ? "text-red-400 font-bold"
                    : isNearLimit
                    ? "text-amber-300"
                    : "text-muted"
                }`}
              >
                {charCount}/{maxChars}
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted/60 border-l border-white/[0.08] pl-2">
                <CornerDownLeft className="w-3 h-3" />
                <span>Ctrl+Enter</span>
              </span>
            </div>

            <motion.button
              type="submit"
              disabled={!text.trim() || isSubmitting || isOverLimit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-1.5 px-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-primary-glow/40 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <span>Post Idea</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              className="flex items-center gap-2 text-red-400 text-xs mt-2.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

