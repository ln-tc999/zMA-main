"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { FiTrendingUp } from "react-icons/fi";
import { HiOutlineBanknotes } from "react-icons/hi2";

type TotalSummaryProps = {
  totalValueUsd: number;
  totalHoldingsUsd: number;
  totalPositionsUsd: number;
  status: "idle" | "loading" | "ready" | "error";
};

function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "$0.00";
  if (value === 0) return "$0.00";
  if (value < 0.01) return "< $0.01";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function TotalSummary({
  totalValueUsd,
  totalHoldingsUsd,
  totalPositionsUsd,
  status,
}: TotalSummaryProps) {
  const isLoading = status === "loading" || status === "idle";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-main bg-surface p-6 ">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(30,64,175,0.22),transparent_55%)]" />
      <div className="relative flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-brand-soft">
            <Image
              src="/Assets/Images/Logo-Brand/logo-transparent.png"
              alt="zMAAI"
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
            Net worth on zMAAI
          </span>
        </div>

        {isLoading ? (
          <motion.div
            className="h-12 w-64 rounded-2xl bg-surface-muted"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <motion.div
            key={totalValueUsd}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-baseline gap-3"
          >
            <span className="text-4xl font-semibold tracking-tight text-main">
              {formatUsd(totalValueUsd)}
            </span>
            <span className="text-xs text-muted">on Arbitrum</span>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <SummaryTile
            label="Wallet holdings"
            value={isLoading ? "—" : formatUsd(totalHoldingsUsd)}
            icon={<HiOutlineBanknotes className="h-3.5 w-3.5" />}
            loading={isLoading}
          />
          <SummaryTile
            label="Earn positions"
            value={isLoading ? "—" : formatUsd(totalPositionsUsd)}
            icon={<FiTrendingUp className="h-3.5 w-3.5" />}
            loading={isLoading}
          />
        </div>
      </div>
    </section>
  );
}

function SummaryTile({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-surface-raised px-4 py-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-faint">
        <span className="text-brand">{icon}</span>
        {label}
      </div>
      {loading ? (
        <motion.div
          className="h-5 w-20 rounded-full bg-surface-muted"
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <span className="text-lg font-semibold text-main">{value}</span>
      )}
    </div>
  );
}
