"use client";

import { FiArrowUpRight, FiExternalLink } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { LifiChainMeta } from "@/lib/lifi-meta";
import type { LifiPortfolioPosition } from "@/lib/lifi-portfolio";
import { resolvePositionUrl, resolveProtocol } from "@/lib/protocol-registry";
import { useWithdrawStore } from "@/stores";
import {
  formatBalance,
  formatUsd,
  resolveExplorerUrl,
  SKELETON_ROWS,
} from "./positions-section-utils";

type PositionsSectionProps = {
  positions?: LifiPortfolioPosition[];
  status: "idle" | "loading" | "ready" | "error";
  networkFilter: number | "all";
  chainsById: Record<number, LifiChainMeta>;
};

export function PositionsSection({
  positions = [],
  status,
  chainsById,
}: PositionsSectionProps) {
  const openWithdrawSheet = useWithdrawStore((state) => state.openSheet);
  const isLoading = status === "loading" || status === "idle";
  const isEmpty = status === "ready" && positions.length === 0;

  return (
    <section className="rounded-3xl border border-main bg-surface p-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-main">
            Earn positions
          </h2>
          <p className="text-xs text-muted">
            Active earn positions tracked by Zama FHE
          </p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.ul
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex flex-col gap-2"
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
            className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-surface-raised px-6 py-10 text-center"
          >
            <HiOutlineSparkles className="h-6 w-6 text-brand" />
            <div>
              <p className="text-sm font-semibold text-main">
                No active earn positions yet
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
                Start earning by depositing into a vault on the Earn page. Your
                positions will appear here automatically.
              </p>
            </div>
            <Link
              href="/earn"
              className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white cursor-pointer transition-colors hover-brand"
            >
              Discover vaults
            </Link>
          </motion.div>
        ) : (
          <motion.ul
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex flex-col gap-2"
          >
            {positions
              ?.filter((p) => p.asset?.address)
              .map((position, index) => {
                const chain = chainsById[position.chainId];
                const usd = Number.parseFloat(position.balanceUsd ?? "0");
                const resolved = resolveProtocol(position.protocolName);
                return (
                  <motion.li
                    key={`${position.chainId}-${position.protocolName}-${position.asset.address}-${index}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.25 }}
                  >
                    <div className="flex w-full items-center justify-between gap-4 rounded-2xl bg-surface-raised px-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0">
                          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-sm font-semibold text-brand">
                            {resolved.logoPath ? (
                              <Image
                                src={resolved.logoPath}
                                alt={resolved.displayName}
                                width={40}
                                height={40}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              resolved.displayName.charAt(0).toUpperCase()
                            )}
                          </span>
                          {chain?.logoURI ? (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border-2 border-(--color-surface-2) bg-(--color-surface-2)">
                              <Image
                                src={chain.logoURI}
                                alt={chain.name}
                                width={12}
                                height={12}
                                className="h-full w-full object-contain"
                                unoptimized
                              />
                            </span>
                          ) : null}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-semibold text-main">
                              {resolved.displayName}
                            </span>
                            {(() => {
                              const url =
                                resolvePositionUrl(
                                  position.protocolName,
                                  position.chainId,
                                  position.asset.address,
                                ) ??
                                resolveExplorerUrl(
                                  position.chainId,
                                  position.asset.address,
                                );
                              if (!url) return null;
                              return (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Open ${resolved.displayName} position`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex text-faint transition-colors hover:text-main"
                                >
                                  <FiExternalLink className="h-3 w-3" />
                                </a>
                              );
                            })()}
                          </span>
                          <span className="truncate text-[11px] text-muted">
                            {position.asset.symbol} ·{" "}
                            {chain?.name ?? `Chain ${position.chainId}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold text-main">
                            {formatUsd(usd)}
                          </span>
                          <span className="text-[11px] text-muted">
                            {formatBalance(
                              position.balanceNative,
                              position.asset.decimals,
                              position.asset.symbol,
                            )}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openWithdrawSheet(position)}
                          className="flex h-7 items-center gap-1 rounded-full bg-brand px-3 text-[10px] font-semibold text-white cursor-pointer transition-colors hover:bg-brand-hover"
                        >
                          Withdraw
                          <FiArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
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
      transition={{ delay: index * 0.06 }}
      className="flex items-center justify-between gap-4 rounded-2xl bg-surface-raised px-4 py-4"
    >
      <div className="flex items-center gap-3">
        <motion.span
          className="h-10 w-10 rounded-full bg-surface-muted"
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="flex flex-col gap-1.5">
          <motion.span
            className="h-3 w-24 rounded-full bg-surface-muted"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{
              duration: 1.6,
              delay: 0.1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.span
            className="h-2.5 w-36 rounded-full bg-surface-muted opacity-60"
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
        className="h-4 w-20 rounded-full bg-surface-muted"
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
