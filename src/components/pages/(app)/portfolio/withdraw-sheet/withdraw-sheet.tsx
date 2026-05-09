"use client";

import {
  FiX,
  FiArrowDown,
  FiCheck,
  FiExternalLink,
  FiLoader,
} from "react-icons/fi";
import { AnimatePresence, motion } from "motion/react";
import { formatUnits } from "viem";
import { useAccount, useChainId, useConfig, useSwitchChain } from "wagmi";
import { useWalletReady } from "@/lib/wallet-ready";
import { useWithdrawStore, useMetaStore } from "@/stores";
import { ConnectPrompt, LoadingState } from "./withdraw-sheet-states";
import type { LifiPortfolioPosition } from "@/lib/lifi-portfolio";

export function WithdrawSheet() {
  const lifiOpen = useWithdrawStore((state) => state.open);
  const lifiCloseSheet = useWithdrawStore((state) => state.closeSheet);
  const lifiPosition = useWithdrawStore((state) => state.position);
  const ready = useWalletReady();

  return (
    <AnimatePresence>
      {lifiOpen ? (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={lifiCloseSheet}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:p-6"
        >
          <motion.div
            key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[520px] overflow-hidden rounded-t-3xl border border-main bg-surface sm:rounded-3xl"
          >
            {ready ? <WithdrawBody /> : <LoadingState />}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function WithdrawBody() {
  const lifiCloseSheet = useWithdrawStore((state) => state.closeSheet);
  const lifiPosition = useWithdrawStore((state) => state.position);

  const { isConnected, address } = useAccount();

  if (!isConnected || !address) {
    return <ConnectPrompt />;
  }

  if (!lifiPosition) return null;

  return (
    <div className="flex flex-col">
      <SheetHeader onClose={lifiCloseSheet} />
      <div className="px-5 pb-5 pt-4">
        <LifiWithdrawFlow />
      </div>
    </div>
  );
}

function SheetHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-main px-5 py-4">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
          Withdraw
        </div>
        <h3 className="text-base font-semibold text-main">
          Pull funds out of your vault
        </h3>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-surface-raised text-muted transition-colors hover:bg-surface-muted hover:text-main"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
}

function LifiWithdrawFlow() {
  const position = useWithdrawStore((state) => state.position);
  const percentage = useWithdrawStore((state) => state.percentage);
  const step = useWithdrawStore((state) => state.step);
  const error = useWithdrawStore((state) => state.error);
  const txHash = useWithdrawStore((state) => state.txHash);
  const setPercentage = useWithdrawStore((state) => state.setPercentage);
  const executeWithdraw = useWithdrawStore((state) => state.executeWithdraw);
  const setStep = useWithdrawStore((state) => state.setStep);

  const config = useConfig();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { address } = useAccount();
  const chainsById = useMetaStore((state) => state.chainsById);

  if (!position) {
    return <LoadingState />;
  }

  const balance = position.balanceNative;
  const decimals = position.asset.decimals;
  const symbol = position.asset.symbol;
  const chainName =
    chainsById[position.chainId]?.name ?? `Chain ${position.chainId}`;
  const protocolName = position.protocolName ?? "Vault";

  const formattedBalance = (() => {
    try {
      return formatUnits(BigInt(balance || "0"), decimals);
    } catch {
      return "0";
    }
  })();

  const withdrawAmount = (() => {
    try {
      const bal = BigInt(balance || "0");
      const pct = BigInt(percentage);
      return formatUnits((bal * pct) / 100n, decimals);
    } catch {
      return "0";
    }
  })();

  if (step === "idle" || step === "ready") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Protocol</span>
            <span className="text-xs font-semibold text-main">
              {protocolName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Chain</span>
            <span className="text-xs font-semibold text-main">{chainName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Balance</span>
            <span className="text-xs font-semibold text-main">
              {formattedBalance} {symbol}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted">Withdraw</span>
            <input
              type="range"
              min={1}
              max={100}
              value={percentage}
              onChange={(e) => setPercentage(Number.parseInt(e.target.value))}
              className="h-1 flex-1 cursor-pointer accent-brand"
            />
            <span className="text-xs font-semibold text-main">
              {percentage}%
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-raised px-3 py-2">
            <span className="text-xs text-muted">Amount to withdraw</span>
            <span className="text-xs font-semibold text-main">
              {withdrawAmount} {symbol}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            if (!address) return;
            if (chainId !== position.chainId) {
              await switchChainAsync({ chainId: position.chainId });
            }
            await executeWithdraw(config, address);
          }}
          disabled={!balance || balance === "0"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiArrowDown className="h-4 w-4" />
          Withdraw
        </button>
      </div>
    );
  }

  if (step === "executing") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <FiLoader className="h-6 w-6 animate-spin text-brand" />
        <p className="text-sm font-semibold text-main">
          Processing withdrawal...
        </p>
        <p className="text-xs text-muted">Please confirm in your wallet</p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(16,185,129,0.1)]">
          <FiCheck className="h-6 w-6 text-[#10B981]" />
        </div>
        <p className="text-sm font-semibold text-main">
          Withdrawal successful!
        </p>
        <p className="text-xs text-muted">
          {withdrawAmount} {symbol} has been sent to your wallet
        </p>
        {txHash && (
          <p className="text-xs text-brand">Tx: {txHash.slice(0, 10)}...</p>
        )}
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-sm font-semibold text-main">Withdrawal failed</p>
        <p className="text-xs text-negative">{error}</p>
        <button
          type="button"
          onClick={() => setStep("idle")}
          className="cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return <LoadingState />;
}
