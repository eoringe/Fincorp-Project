"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, X, Check, Edit3 } from "lucide-react";

interface DisplayNameModalProps {
  currentName: string;
  onSave: (name: string) => void;
}

/**
 * Modern Display Name Editor with user initials avatar,
 * inline edit form, and smooth transitions.
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

  const initial = (currentName || "U").slice(0, 1).toUpperCase();

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.form
            key="editing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSave}
            className="flex items-center gap-1.5 p-1 rounded-full bg-white border border-primary/40 shadow-md shadow-primary-glow/10"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Your name"
              autoFocus
              className="w-24 sm:w-36 bg-transparent px-2 sm:px-2.5 py-1 text-xs text-foreground placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              className="p-1 rounded-full bg-success/20 text-success hover:bg-success/30 transition-colors cursor-pointer"
              aria-label="Save name"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 rounded-full bg-slate-100 text-muted hover:text-red-500 transition-colors cursor-pointer"
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
            onClick={() => {
              setName(currentName);
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-primary/30 transition-all duration-150 group cursor-pointer"
            aria-label="Change display name"
          >
            {/* Avatar Circle */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white shadow-xs shrink-0">
              {initial}
            </div>

            <span className="text-xs text-muted-foreground group-hover:text-foreground font-medium max-w-[85px] sm:max-w-[120px] truncate">
              {currentName || "Set Name"}
            </span>

            <Edit3 className="w-3 h-3 text-muted/60 group-hover:text-primary transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

