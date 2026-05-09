"use client";

import { FiAlertTriangle, FiInbox } from "react-icons/fi";
import { motion } from "motion/react";

const SKELETON_ROWS = Array.from({ length: 5 }, (_, i) => i);

export function SkeletonList() {
  return (
    <motion.ul
      key="skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-3 flex flex-col gap-2"
    >
      {SKELETON_ROWS.map((index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface-raised px-4 py-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="h-10 w-10 rounded-full bg-surface-muted"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="flex flex-col gap-2">
                <motion.div
                  className="h-3 w-28 rounded-full bg-surface-muted"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 1.6,
                    delay: 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="h-2.5 w-44 rounded-full bg-surface-muted"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{
                    duration: 1.6,
                    delay: 0.25,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-5">
              <motion.div
                className="hidden h-6 w-14 rounded-full bg-surface-muted sm:block"
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{
                  duration: 1.6,
                  delay: 0.35,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="hidden h-6 w-14 rounded-full bg-surface-muted sm:block"
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{
                  duration: 1.6,
                  delay: 0.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="h-7 w-16 rounded-full bg-surface-muted"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.6,
                  delay: 0.55,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );
}

export function EmptyState() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-3 flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-raised px-6 py-10 text-center"
    >
      <FiInbox className="h-6 w-6 text-muted" />
      <p className="text-sm font-semibold text-main">No vaults available</p>
      <p className="max-w-xs text-xs text-muted">
        Try another token or chain — we couldn&apos;t find routes for this
        combination on Zama FHE vaults.
      </p>
    </motion.div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-3 flex flex-col items-center justify-center gap-2 rounded-2xl border border-[rgba(250,43,57,0.35)] bg-[rgba(250,43,57,0.08)] px-6 py-10 text-center"
    >
      <FiAlertTriangle className="h-6 w-6 text-(--color-negative)" />
      <p className="text-sm font-semibold text-main">Something went wrong</p>
      <p className="max-w-xs text-xs text-muted">{message}</p>
    </motion.div>
  );
}
