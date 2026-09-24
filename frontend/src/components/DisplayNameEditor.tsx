"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, X, Check } from "lucide-react";

interface DisplayNameModalProps {
  currentName: string;
  onSave: (name: string) => void;
}

/**
 * Inline display name editor.
 * Clicking the name or "Set Name" button reveals an input to change it.
 * Saves to parent state (which persists to localStorage).
 */
export default function DisplayNameEditor({
  currentName,
  onSave,
}: DisplayNameModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);

  function handleSave(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = name.trim();
    onSave(trimmed);
    setIsEditing(false);
  }

  function handleCancel() {
    setName(currentName);
    setIsEditing(false);
  }

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.form
            key="editing"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            onSubmit={handleSave}
            className="flex items-center gap-1.5 overflow-hidden"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Your name"
              autoFocus
              className="w-32 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              className="p-1.5 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors"
              aria-label="Save name"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              aria-label="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.form>
        ) : (
          <motion.button
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <User className="w-3.5 h-3.5" />
            <span className="group-hover:underline underline-offset-2">
              {currentName || "Set your name"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
