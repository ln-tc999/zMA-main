"use client";

import { FiCheck, FiClock, FiExternalLink } from "react-icons/fi";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useWalletReady } from "@/lib/wallet-ready";
import {
  useExpertStore,
  useMetaStore,
  useNoxDepositStore,
  useZamaDepositStore,
} from "@/stores";
import { IdleAggregatorCard } from "../idle-aggregator-card";
import {
  formatApy,
  formatTimelock,
  formatTvl,
  resolveVaultLink,
  RISK_CLASS,
  RISK_LABEL,
  sortVaults,
} from "./vault-list-utils";
import { RiskFilterChips } from "./risk-filter-chips";
import { ProtocolFilterDropdown } from "./protocol-filter-dropdown";
import {
  APY_PRESETS,
  MinThresholdDropdown,
  TVL_PRESETS,
} from "./min-threshold-dropdown";
import { EmptyState, ErrorState, SkeletonList } from "./vault-list-states";

export function VaultList() {
  const vaults = useExpertStore((state) => state.vaults);
  const sortBy = useExpertStore((state) => state.sortBy);
  const selectedVaultId = useExpertStore((state) => state.selectedVaultId);
  const status = useExpertStore((state) => state.status);
  const error = useExpertStore((state) => state.error);
  const token = useExpertStore((state) => state.token);
  const chain = useExpertStore((state) => state.chain);
  const amount = useExpertStore((state) => state.amount);
  const showOnlyTransactional = useExpertStore(
    (state) => state.showOnlyTransactional,
  );
  const riskFilter = useExpertStore((state) => state.riskFilter);
  const protocolFilter = useExpertStore((state) => state.protocolFilter);
  const apyMinFilter = useExpertStore((state) => state.apyMinFilter);
  const tvlMinFilter = useExpertStore((state) => state.tvlMinFilter);
  const setShowOnlyTransactional = useExpertStore(
    (state) => state.setShowOnlyTransactional,
  );
  const setRiskFilter = useExpertStore((state) => state.setRiskFilter);
  const setProtocolFilter = useExpertStore((state) => state.setProtocolFilter);
  const setApyMinFilter = useExpertStore((state) => state.setApyMinFilter);
  const setTvlMinFilter = useExpertStore((state) => state.setTvlMinFilter);
  const selectVault = useExpertStore((state) => state.selectVault);
  const fetchVaults = useExpertStore((state) => state.fetchVaults);
  const openZamaDepositSheet = useZamaDepositStore((state) => state.openSheet);
  const chainsById = useMetaStore((state) => state.chainsById);
  const protocolsByName = useMetaStore((state) => state.protocolsByName);
  const loadMeta = useMetaStore((state) => state.loadMeta);
  const walletReady = useWalletReady();

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const parsedAmount = Number.parseFloat(amount || "0");
  const amountIsValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  useEffect(() => {
    if (!amountIsValid) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      fetchVaults();
    }, 450);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [token, chain, amountIsValid, fetchVaults]);

  const filtered = useMemo(() => {
    const base = showOnlyTransactional
      ? vaults.filter((vault) => vault.isTransactional)
      : vaults;
    const afterRisk =
      riskFilter === "all"
        ? base
        : base.filter((vault) => vault.risk === riskFilter);
    const afterProtocol = !protocolFilter
      ? afterRisk
      : afterRisk.filter((vault) => vault.protocolKey === protocolFilter);
    const afterApy =
      apyMinFilter === null
        ? afterProtocol
        : afterProtocol.filter((vault) => vault.apy >= apyMinFilter);
    const afterTvl =
      tvlMinFilter === null
        ? afterApy
        : afterApy.filter((vault) => vault.tvlUsd >= tvlMinFilter);
    return afterTvl;
  }, [
    vaults,
    showOnlyTransactional,
    riskFilter,
    protocolFilter,
    apyMinFilter,
    tvlMinFilter,
  ]);

  const protocolOptions = useMemo(() => {
    const base = showOnlyTransactional
      ? vaults.filter((vault) => vault.isTransactional)
      : vaults;
    const map = new Map<
      string,
      { key: string; label: string; logo?: string; count: number }
    >();
    for (const vault of base) {
      const existing = map.get(vault.protocolKey);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(vault.protocolKey, {
          key: vault.protocolKey,
          label: vault.protocol,
          logo: vault.protocolLogoUri,
          count: 1,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [vaults, showOnlyTransactional]);

  const activeProtocolOption = useMemo(
    () =>
      protocolFilter
        ? (protocolOptions.find((option) => option.key === protocolFilter) ??
          null)
        : null,
    [protocolFilter, protocolOptions],
  );

  const riskCounts = useMemo(() => {
    const base = showOnlyTransactional
      ? vaults.filter((vault) => vault.isTransactional)
      : vaults;
    return base.reduce(
      (acc, vault) => {
        acc[vault.risk] = (acc[vault.risk] ?? 0) + 1;
        return acc;
      },
      { low: 0, medium: 0, high: 0 } as Record<
        "low" | "medium" | "high",
        number
      >,
    );
  }, [vaults, showOnlyTransactional]);

  const sorted = useMemo(
    () => sortVaults(filtered, sortBy),
    [filtered, sortBy],
  );
  const best = sorted[0];
  const selectedVault = useMemo(
    () => sorted.find((vault) => vault.id === selectedVaultId) ?? null,
    [sorted, selectedVaultId],
  );
  const isLoading = status === "idle" || status === "loading";
  const hasError = status === "error";
  const hasData = status === "success" && sorted.length > 0;
  const isEmpty = status === "success" && sorted.length === 0;

  const hasValidAmount = amountIsValid;
  const depositDisabled =
    !hasData ||
    !selectedVault ||
    !selectedVault.isTransactional ||
    !hasValidAmount;

  function handleDepositClick() {
    if (!selectedVault || !hasValidAmount) return;
    openZamaDepositSheet(
      {
        address: selectedVault.id,
        name: selectedVault.vaultName,
        symbol: selectedVault.vaultSymbol || `${selectedVault.protocol}-Vault`,
        asset: selectedVault.asset || "0x",
        decimals: 18,
        tvl: selectedVault.tvlUsd.toFixed(2),
        apy: selectedVault.apy,
        isConfidential: true,
      },
      { address: "0x", symbol: token.symbol, decimals: 18 },
      amount,
    );
  }

  if (!hasValidAmount) {
    return <IdleAggregatorCard />;
  }

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col rounded-3xl border border-main bg-surface p-3  mb-10">
      <header className="flex items-center justify-between px-3 pt-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-brand-soft">
            <Image
              src="/Assets/Images/Logo-Brand/logo-transparent.png"
              alt="zMAAI"
              width={32}
              height={32}
              className="h-8 w-8 object-contain rounded-full"
            />
          </span>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-[0.16em] text-faint">
              Routes
            </span>
            <h2 className="text-base font-semibold tracking-tight text-main">
              Vault Aggregator
            </h2>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <MinThresholdDropdown
            label="APY"
            kind="apy"
            presets={APY_PRESETS}
            placeholder="e.g. 7.5"
            active={apyMinFilter}
            onSelect={setApyMinFilter}
          />
          <MinThresholdDropdown
            label="TVL"
            kind="tvl"
            presets={TVL_PRESETS}
            placeholder="e.g. 2M"
            active={tvlMinFilter}
            onSelect={setTvlMinFilter}
          />
          <ProtocolFilterDropdown
            active={activeProtocolOption}
            options={protocolOptions}
            onSelect={setProtocolFilter}
          />
        </div>
      </header>

      <div className="mt-2 flex flex-col gap-2 px-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            {hasData ? (
              <>
                <span>
                  {sorted.length} route{sorted.length === 1 ? "" : "s"} via
                </span>
                <span className="font-semibold text-main">LI.FI</span>
              </>
            ) : (
              <span>Discovering vault routes</span>
            )}
          </span>
          <RiskFilterChips
            active={riskFilter}
            counts={riskCounts}
            onSelect={setRiskFilter}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowOnlyTransactional(!showOnlyTransactional)}
          className="flex items-center gap-1.5 self-start rounded-full bg-surface-raised px-3 py-1 text-[11px] font-semibold text-muted cursor-pointer transition-colors duration-200 hover:text-main"
        >
          <motion.span
            className={`flex h-3 w-3 items-center justify-center rounded-full ${showOnlyTransactional ? "bg-brand" : "bg-surface-muted"}`}
            animate={{ scale: showOnlyTransactional ? 1 : 0.85 }}
          >
            {showOnlyTransactional ? (
              <FiCheck className="h-2 w-2 text-white" />
            ) : null}
          </motion.span>
          One-click deposit only
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <SkeletonList key="skeleton" />
          ) : hasError ? (
            <ErrorState
              key="error"
              message={error ?? "Unable to reach Nox Protocol."}
            />
          ) : isEmpty ? (
            <EmptyState key="empty" />
          ) : hasData ? (
            <motion.ul
              key="data"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1"
            >
              {sorted.map((vault, index) => {
                const isSelected = vault.id === selectedVaultId;
                const isBest = vault.id === best?.id;
                const protocolMeta =
                  protocolsByName[vault.protocolKey] ??
                  protocolsByName[
                  vault.protocol.toLowerCase().replace(/\s+/g, "-")
                  ];
                const protocolLogoUri =
                  vault.protocolLogoUri ??
                  protocolMeta?.logoUri ??
                  protocolMeta?.logoURI;
                const chainLogo = chainsById[vault.chainId]?.logoURI;
                const showAvg30d =
                  vault.apy30d !== null &&
                  Math.abs(vault.apy30d - vault.apy) > 0.05;
                const timelockLabel = formatTimelock(vault.timeLock);

                return (
                  <motion.li
                    key={vault.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.04,
                      duration: 0.3,
                      ease: "easeOut",
                      layout: { type: "spring", stiffness: 380, damping: 32 },
                    }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => selectVault(vault.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectVault(vault.id);
                        }
                      }}
                      className={
                        isSelected
                          ? "flex w-full items-center justify-between gap-4 rounded-2xl border border-strong bg-surface-raised px-4 py-3 text-left cursor-pointer transition-all duration-200 ease-in-out"
                          : "flex w-full items-center justify-between gap-4 rounded-2xl border border-transparent bg-surface-raised px-4 py-3 text-left cursor-pointer transition-all duration-200 ease-in-out hover:border-main hover:bg-surface-muted"
                      }
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0">
                          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-sm font-semibold text-brand">
                            {protocolLogoUri ? (
                              <Image
                                src={protocolLogoUri}
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
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border-2 border-(--color-surface-2) bg-(--color-surface-2)">
                              <Image
                                src={chainLogo}
                                alt={vault.chainShortName}
                                width={16}
                                height={16}
                                className="h-full w-full object-contain"
                                unoptimized
                              />
                            </span>
                          ) : null}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-main">
                              {vault.protocol}
                            </span>
                            {(() => {
                              const link = resolveVaultLink(vault);
                              if (!link) return null;
                              return (
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Open ${vault.protocol} vault details`}
                                  onClick={(event) => event.stopPropagation()}
                                  className="flex text-faint transition-colors hover:text-main"
                                >
                                  <FiExternalLink className="h-3.5 w-3.5" />
                                </a>
                              );
                            })()}
                            {isBest ? (
                              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand">
                                BEST
                              </span>
                            ) : null}
                            {!vault.isTransactional ? (
                              <span
                                title="Not supported"
                                className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-muted"
                              >
                                VIEW ONLY
                              </span>
                            ) : null}
                          </div>
                          <span className="line-clamp-1 text-xs text-muted">
                            {vault.vaultName} · {vault.chainShortName}
                          </span>
                          {timelockLabel || vault.kyc ? (
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              {timelockLabel ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-muted">
                                  <FiClock className="h-2.5 w-2.5" />
                                  {timelockLabel}
                                </span>
                              ) : null}
                              {vault.kyc ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-muted">
                                  <HiOutlineShieldCheck className="h-2.5 w-2.5" />
                                  KYC
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-5">
                        <div className="hidden flex-col items-end sm:flex">
                          <span className="text-[10px] uppercase tracking-wide text-faint">
                            TVL
                          </span>
                          <span className="text-sm font-medium text-main">
                            {formatTvl(vault.tvlUsd)}
                          </span>
                        </div>
                        <div className="hidden flex-col items-end sm:flex">
                          <span className="text-[10px] uppercase tracking-wide text-faint">
                            Risk
                          </span>
                          <span
                            className={`mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${RISK_CLASS[vault.risk]}`}
                          >
                            {RISK_LABEL[vault.risk]}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] uppercase tracking-wide text-faint">
                            APY
                          </span>
                          <span className="text-base font-semibold text-[#60a5fa]">
                            {formatApy(vault.apy)}
                          </span>
                          {showAvg30d && vault.apy30d !== null ? (
                            <span className="text-[10px] text-faint">
                              30d · {formatApy(vault.apy30d)}
                            </span>
                          ) : null}
                        </div>
                        <span
                          className={
                            isSelected
                              ? "flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white"
                              : "flex h-6 w-6 items-center justify-center rounded-full border border-main bg-surface text-transparent"
                          }
                        >
                          <FiCheck className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-3 px-1 pb-1">
        {walletReady ? (
          <DepositButton
            depositDisabled={depositDisabled}
            hasValidAmount={hasValidAmount}
            isViewOnly={!!selectedVault && !selectedVault.isTransactional}
            onDeposit={handleDepositClick}
          />
        ) : (
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Connect wallet
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 pb-1">
        <span className="text-[11px] font-medium text-faint">Powered by</span>
        <span className="text-[11px] font-semibold tracking-tight text-muted">
          Zama FHE
        </span>
      </div>
    </section>
  );
}

function DepositButton({
  depositDisabled,
  hasValidAmount,
  isViewOnly,
  onDeposit,
}: {
  depositDisabled: boolean;
  hasValidAmount: boolean;
  isViewOnly: boolean;
  onDeposit: () => void;
}) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal, mounted }) => (
          <button
            type="button"
            disabled={!mounted}
            onClick={openConnectModal}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white cursor-pointer transition-all duration-200 ease-in-out hover-brand active:scale-[0.98] disabled:opacity-50"
          >
            Connect wallet
          </button>
        )}
      </ConnectButton.Custom>
    );
  }

  return (
    <button
      type="button"
      onClick={onDeposit}
      disabled={depositDisabled}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white cursor-pointer transition-all duration-200 ease-in-out hover-brand active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {!hasValidAmount
        ? "Enter an amount to continue"
        : isViewOnly
          ? "Selected vault not supported"
          : "Review deposit"}
    </button>
  );
}
