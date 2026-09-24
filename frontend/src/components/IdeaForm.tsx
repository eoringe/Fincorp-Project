"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";

const FLASK_API = process.env.NEXT_PUBLIC_FLASK_API_URL;

/**
 * Form component for submitting new ideas.
 * Posts to the Flask backend for validation and insertion.
 */
export default function IdeaForm() {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const charCount = text.length;
  const maxChars = 200;
  const isNearLimit = charCount > 170;
  const isOverLimit = charCount > maxChars;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden">
          <textarea
            id="idea-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="💡 Share your brilliant idea or question..."
            rows={3}
            className="w-full bg-transparent p-5 pb-12 text-foreground placeholder:text-muted resize-none focus:outline-none text-[15px] leading-relaxed"
          />
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-t border-border/50">
            <span
              className={`text-xs font-mono transition-colors ${
                isOverLimit
                  ? "text-red-400"
                  : isNearLimit
                  ? "text-accent"
                  : "text-muted"
              }`}
            >
              {charCount}/{maxChars}
            </span>
            <motion.button
              type="submit"
              disabled={!text.trim() || isSubmitting || isOverLimit}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium py-2 px-5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary-glow text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm mt-3 pl-1"
        >
          ⚠ {error}
        </motion.p>
      )}
    </motion.form>
  );
}
