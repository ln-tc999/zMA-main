"use client";

import { HiOutlineBanknotes } from "react-icons/hi2";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import type { PortfolioHolding } from "@/lib/portfolio-fetcher";
import {
  formatAmount,
  formatPrice,
  formatUsd,
  SKELETON_ROWS,
} from "./tokens-section-utils";

type TokensSectionProps = {
  holdings: PortfolioHolding[];
  status: "idle" | "loading" | "ready" | "error";
  networkFilter: number | "all";
};

export function TokensSection({ holdings = [], status }: TokensSectionProps) {
  const isLoading = status === "loading" || status === "idle";
  const isEmpty = status === "ready" && holdings.length === 0;

  return (
    <section className="rounded-3xl border border-main bg-surface p-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-main">
            Tokens
          </h2>
          <p className="text-xs text-muted">
            {isLoading
              ? "Scanning balances on Arbitrum…"
              : `${holdings.length} token${holdings.length === 1 ? "" : "s"} tracked`}
          </p>
        </div>
      </header>

      <div className="mt-4 hidden grid-cols-[minmax(0,1fr)_150px_200px_135px] items-center px-4 text-[10px] font-semibold uppercase tracking-wide text-faint sm:grid">
        <span>Token</span>
        <span className="text-right">Price</span>
        <span className="text-right">Balance</span>
        <span className="text-right">Value</span>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.ul
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 flex flex-col gap-2"
          >
            {SKELETON_ROWS.map((index) => (
              <SkeletonRow key={index} index={index} />
            ))}
          </motion.ul>
        ) : isEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex flex-col items-center gap-2 rounded-2xl bg-surface-raised px-6 py-10 text-center"
          >
            <HiOutlineBanknotes className="h-6 w-6 text-muted" />
            <p className="text-sm font-semibold text-main">
              No token balances found
            </p>
            <p className="max-w-sm text-xs text-muted">
              We couldn&apos;t find any balances across the supported networks.
              Bridge in funds to start earning on zMAAI.
            </p>
          </motion.div>
        ) : (
          <motion.ul
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 flex flex-col gap-2"
          >
            {holdings.map((holding, index) => (
              <motion.li
                key={`${holding.chainId}-${holding.tokenAddress}-${holding.symbol}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.24 }}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl bg-surface-raised px-4 py-3 sm:grid-cols-[minmax(0,1fr)_140px_180px_120px]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-9 w-9 flex-shrink-0">
                    <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surface-muted">
                      {holding.logoURI ? (
                        <Image
                          src={holding.logoURI}
                          alt={holding.symbol}
                          width={36}
                          height={36}
                          className="h-full w-full object-contain"
                          unoptimized
                        />
                      ) : (
                        <span className="text-[11px] font-semibold text-main">
                          {holding.symbol.charAt(0)}
                        </span>
                      )}
                    </span>
                    {holding.chainLogo ? (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-surface-2)] bg-[var(--color-surface-2)]">
                        <Image
                          src={holding.chainLogo}
                          alt={holding.chainName}
                          width={12}
                          height={12}
                          className="h-full w-full object-contain"
                          unoptimized
                        />
                      </span>
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-main">
                      {holding.symbol}
                    </span>
                    <span className="truncate text-[11px] text-muted">
                      {holding.name} · {holding.chainName}
                    </span>
                  </div>
                </div>
                <span className="hidden text-right text-sm text-main sm:block">
                  {formatPrice(holding.priceUsd)}
                </span>
                <span className="hidden text-right text-sm text-main sm:block">
                  {formatAmount(holding.amount, holding.symbol)}
                </span>
                <span className="text-right text-sm font-semibold text-main">
                  {formatUsd(holding.valueUsd)}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  );
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between gap-4 rounded-2xl bg-surface-raised px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <motion.span
          className="h-9 w-9 rounded-full bg-surface-muted"
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="flex flex-col gap-1.5">
          <motion.span
            className="h-3 w-20 rounded-full bg-surface-muted"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{
              duration: 1.6,
              delay: 0.1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.span
            className="h-2.5 w-32 rounded-full bg-surface-muted opacity-60"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{
              duration: 1.6,
              delay: 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
      <motion.span
        className="h-4 w-16 rounded-full bg-surface-muted"
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{
          duration: 1.6,
          delay: 0.3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.li>
  );
}
