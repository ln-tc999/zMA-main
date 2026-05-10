"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { FiCheck, FiExternalLink, FiPlus, FiTrash2, FiX } from "react-icons/fi";

const IEX_AI_LOGO = "/Assets/Images/Logo-Brand/logo.png";
import {
  formatApy,
  formatTimelock,
  formatTvl,
  resolveVaultLink,
  RISK_CLASS,
  RISK_LABEL,
} from "@/components/pages/(app)/earn/vault-list/vault-list-utils";
import { mockChains } from "@/data";
import {
  COMPARE_MAX_SLOTS,
  useCompareStore,
  useDepositStore,
  useMetaStore,
} from "@/stores";
import type { Chain, Token, VaultStrategy } from "@/types";
import { VaultPickerSheet } from "./vault-picker-sheet";

const DepositSheet = dynamic(
  () =>
    import("@/components/pages/(app)/earn/deposit-sheet").then(
      (m) => m.DepositSheet,
    ),
  { ssr: false },
);

const WRAPPED_TO_NATIVE: Record<string, string> = {
  WETH: "ETH",
  WBNB: "BNB",
  WAVAX: "AVAX",
  WMATIC: "MATIC",
  WPOL: "POL",
  WCELO: "CELO",
  WS: "S",
};

type WinnerMap = {
  apy: string | null;
  apy30d: string | null;
  tvl: string | null;
  risk: string | null;
};

export function CompareView() {
  const selectedVaults = useCompareStore((s) => s.selectedVaults);
  const removeVault = useCompareStore((s) => s.removeVault);
  const clearAll = useCompareStore((s) => s.clearAll);
  const openPicker = useCompareStore((s) => s.openPicker);
  const loadMeta = useMetaStore((s) => s.loadMeta);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const winners = useMemo(
    () => computeWinners(selectedVaults),
    [selectedVaults],
  );

  const slots = useMemo(() => {
    const filled = selectedVaults.map((vault) => ({ vault }));
    const empty = Array.from(
      { length: COMPARE_MAX_SLOTS - selectedVaults.length },
      () => ({ vault: null }),
    );
    return [...filled, ...empty];
  }, [selectedVaults]);

  const isEmpty = selectedVaults.length === 0;

  return (
    <>
      <main className="mx-auto flex w-full max-w-310 flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 mb-15">
        <header className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand">
            <Image
              src={IEX_AI_LOGO}
              alt="zMAAI"
              width={14}
              height={14}
              className="h-3.5 w-3.5 object-contain"
            />
            Compare
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-main sm:text-3xl">
            Side-by-side vault comparison
          </h1>
          <p className="max-w-2xl text-sm text-muted">
            Pick up to {COMPARE_MAX_SLOTS} vaults from{" "}
            <span className="font-semibold text-main">Nox Protocol</span> and
            see APY, TVL, and risk laid out next to each other. Best metric in
            each row gets a winner badge — pick your route faster.
          </p>
        </header>

        {!isEmpty ? (
          <div className="flex items-center justify-between rounded-2xl border border-main bg-surface px-4 py-3">
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>
                <span className="font-semibold text-main">
                  {selectedVaults.length}
                </span>
                {" / "}
                {COMPARE_MAX_SLOTS} vaults selected
              </span>
              <span className="hidden h-3 w-px bg-(--color-line) sm:inline" />
              <span className="hidden sm:inline">
                Tap a vault card on the right to add another, or remove with the
                × icon.
              </span>
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-main bg-surface-raised px-3 py-1.5 text-[11px] font-semibold text-muted transition-colors hover:border-strong hover:text-main"
            >
              <FiTrash2 className="h-3 w-3" />
              Clear all
            </button>
          </div>
        ) : null}

        {isEmpty ? (
          <EmptyState onAdd={openPicker} />
        ) : (
          <CompareGrid
            slots={slots}
            winners={winners}
            onAdd={openPicker}
            onRemove={removeVault}
          />
        )}

        <ComparePromptHint show={!isEmpty} />

        <Footer />
      </main>
      <VaultPickerSheet />
      <DepositSheet />
    </>
  );
}

function buildSupplyContext(
  vault: VaultStrategy,
  tokensBySymbol: ReturnType<typeof useMetaStore.getState>["tokensBySymbol"],
): { token: Token; chain: Chain } | null {
  const chain =
    mockChains.find((c) => c.id === vault.chainId) ??
    ({
      id: vault.chainId,
      name: vault.chainShortName,
      shortName: vault.chainShortName,
    } as Chain);

  const upper = vault.tokenSymbol.toUpperCase();
  const nativeSymbol = WRAPPED_TO_NATIVE[upper];
  const chainTokens = tokensBySymbol[vault.chainId] ?? {};

  const preferredMeta = nativeSymbol ? chainTokens[nativeSymbol] : undefined;
  const wrappedMeta = chainTokens[upper];
  const meta = preferredMeta ?? wrappedMeta;

  const token: Token = meta
    ? {
      symbol: meta.symbol,
      name: meta.name ?? meta.symbol,
      usdPrice: Number.parseFloat(meta.priceUSD ?? "0") || 0,
    }
    : {
      symbol: vault.tokenSymbol,
      name: vault.tokenSymbol,
      usdPrice: 0,
    };

  return { token, chain };
}

function CompareGrid({
  slots,
  winners,
  onAdd,
  onRemove,
}: {
  slots: { vault: VaultStrategy | null }[];
  winners: WinnerMap;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const chainsById = useMetaStore((s) => s.chainsById);
  const tokensBySymbol = useMetaStore((s) => s.tokensBySymbol);
  const openDepositSheet = useDepositStore((s) => s.openSheet);

  function handleSupply(vault: VaultStrategy) {
    const ctx = buildSupplyContext(vault, tokensBySymbol);
    if (!ctx) return;
    openDepositSheet({
      vault,
      token: ctx.token,
      chain: ctx.chain,
      amount: "",
    });
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[760px] grid-cols-4 gap-3">
        {slots.map((slot, index) => (
          <div key={slot.vault?.id ?? `empty-${index}`} className="min-w-0">
            {slot.vault ? (
              <VaultColumn
                vault={slot.vault}
                winners={winners}
                chainLogo={chainsById[slot.vault.chainId]?.logoURI}
                onRemove={() => onRemove(slot.vault!.id)}
                onSupply={() => handleSupply(slot.vault!)}
              />
            ) : (
              <EmptyColumn onAdd={onAdd} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VaultColumn({
  vault,
  winners,
  chainLogo,
  onRemove,
  onSupply,
}: {
  vault: VaultStrategy;
  winners: WinnerMap;
  chainLogo?: string;
  onRemove: () => void;
  onSupply: () => void;
}) {
  const externalLink = resolveVaultLink(vault);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex h-full flex-col gap-3 rounded-3xl border border-main bg-surface p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative h-10 w-10 shrink-0">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-sm font-semibold text-brand">
              {vault.protocolLogoUri ? (
                <Image
                  src={vault.protocolLogoUri}
                  alt={vault.protocol}
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              ) : (
                vault.protocol.charAt(0).toUpperCase()
              )}
            </span>
            {chainLogo ? (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border-2 border-(--color-surface-1) bg-(--color-surface-1)">
                <Image
                  src={chainLogo}
                  alt={vault.chainShortName}
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
              {vault.protocol}
            </span>
            <span className="truncate text-[11px] text-muted">
              {vault.tokenSymbol} · {vault.chainShortName}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${vault.protocol}`}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-raised text-faint transition-colors hover:text-main"
        >
          <FiX className="h-3.5 w-3.5" />
        </button>
      </div>

      <span className="truncate text-[11px] text-faint" title={vault.vaultName}>
        {vault.vaultName}
      </span>

      <div className="mt-1 flex flex-col gap-2">
        <Metric
          label="APY"
          value={formatApy(vault.apy)}
          highlight={winners.apy === vault.id}
          accent="brand"
        />
        <Metric
          label="30d APY"
          value={vault.apy30d === null ? "—" : formatApy(vault.apy30d)}
          highlight={winners.apy30d === vault.id}
        />
        <Metric
          label="TVL"
          value={formatTvl(vault.tvlUsd)}
          highlight={winners.tvl === vault.id}
        />
        <RiskMetric vault={vault} highlight={winners.risk === vault.id} />
        <Metric
          label="Timelock"
          value={vault.timeLock > 0 ? formatTimelock(vault.timeLock) : "None"}
        />
        <BoolMetric label="One-click deposit" value={vault.isTransactional} />
        <BoolMetric label="KYC" value={vault.kyc} invertSentiment />
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-3">
        <button
          type="button"
          onClick={onSupply}
          disabled={!vault.isTransactional}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-brand px-4 py-2.5 text-xs font-semibold text-white transition-colors hover-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          {vault.isTransactional
            ? "Supply to this vault"
            : "Not one-click eligible"}
        </button>
        {externalLink ? (
          <a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-main bg-surface-raised px-4 py-2 text-[11px] font-semibold text-muted transition-colors hover:border-strong hover:text-main"
          >
            View vault
            <FiExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>
    </motion.article>
  );
}

function ComparePromptHint({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p className="text-center text-[11px] text-faint">
      Click{" "}
      <span className="font-semibold text-muted">Supply to this vault</span> on
      any column to enter an amount and deposit in one signed transaction — no
      need to leave this page.
    </p>
  );
}

function EmptyColumn({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="group flex h-full min-h-[420px] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-(--color-line) bg-transparent px-4 py-8 text-center transition-all hover:border-(--color-line-strong) hover:bg-surface/50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand transition-transform group-hover:scale-110">
        <FiPlus className="h-5 w-5" />
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-main">Add vault</span>
        <span className="text-[11px] text-muted">
          Discover from Nox Protocol
        </span>
      </div>
    </button>
  );
}

function Metric({
  label,
  value,
  highlight = false,
  accent = "default",
}: {
  label: string;
  value: string;
  highlight?: boolean;
  accent?: "default" | "brand";
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-raised px-3 py-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted">{label}</span>
        <AnimatePresence>
          {highlight ? (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="rounded-full bg-(--color-positive) px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
            >
              Best
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      <span
        className={
          accent === "brand"
            ? "text-base font-semibold text-brand"
            : "text-sm font-semibold text-main"
        }
      >
        {value}
      </span>
    </div>
  );
}

function RiskMetric({
  vault,
  highlight,
}: {
  vault: VaultStrategy;
  highlight: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-raised px-3 py-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted">Risk</span>
        <AnimatePresence>
          {highlight ? (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="rounded-full bg-(--color-positive) px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
            >
              Safest
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${RISK_CLASS[vault.risk]}`}
      >
        {RISK_LABEL[vault.risk]}
      </span>
    </div>
  );
}

function BoolMetric({
  label,
  value,
  invertSentiment = false,
}: {
  label: string;
  value: boolean;
  invertSentiment?: boolean;
}) {
  const isPositive = invertSentiment ? !value : value;
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-raised px-3 py-2">
      <span className="text-[11px] text-muted">{label}</span>
      <span
        className={`flex items-center gap-1 text-[11px] font-semibold ${isPositive ? "text-(--color-positive)" : "text-faint"}`}
      >
        {value ? (
          <>
            <FiCheck className="h-3 w-3" />
            Yes
          </>
        ) : (
          <>
            <FiX className="h-3 w-3" />
            No
          </>
        )}
      </span>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-(--color-line) bg-surface/40 px-6 py-16 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft">
        <Image
          src={IEX_AI_LOGO}
          alt="zMAAI"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
      </span>
      <div className="flex max-w-md flex-col gap-2">
        <h2 className="text-lg font-semibold text-main">
          Start your comparison
        </h2>
        <p className="text-sm text-muted">
          Add up to {COMPARE_MAX_SLOTS} vaults from any protocol on Arbitrum,
          Base, Ethereum and more. We'll lay out APY, TVL, risk, and lock terms
          side-by-side so you can pick the best route in seconds.
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover-brand"
      >
        <FiPlus className="h-4 w-4" />
        Add your first vault
      </button>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-faint">
        <span>Powered by</span>
        <span className="font-semibold text-muted">Nox Protocol</span>
      </div>
    </motion.div>
  );
}

function Footer() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-faint">
      <span>Vault data live from</span>
      <span className="font-semibold text-muted">Nox Protocol</span>
      <span>·</span>
      <span>Best metrics highlighted automatically</span>
    </div>
  );
}

function computeWinners(vaults: VaultStrategy[]): WinnerMap {
  if (vaults.length < 2) {
    return { apy: null, apy30d: null, tvl: null, risk: null };
  }
  const riskScore = { low: 0, medium: 1, high: 2 } as const;

  const bestApy = vaults.reduce((a, b) => (b.apy > a.apy ? b : a));
  const withApy30 = vaults.filter((v) => v.apy30d !== null);
  const bestApy30 =
    withApy30.length > 0
      ? withApy30.reduce((a, b) => ((b.apy30d ?? 0) > (a.apy30d ?? 0) ? b : a))
      : null;
  const bestTvl = vaults.reduce((a, b) => (b.tvlUsd > a.tvlUsd ? b : a));
  const safest = vaults.reduce((a, b) =>
    riskScore[b.risk] < riskScore[a.risk] ? b : a,
  );
  const allSameRisk = vaults.every((v) => v.risk === vaults[0].risk);

  return {
    apy: bestApy.id,
    apy30d: bestApy30?.id ?? null,
    tvl: bestTvl.id,
    risk: allSameRisk ? null : safest.id,
  };
}
