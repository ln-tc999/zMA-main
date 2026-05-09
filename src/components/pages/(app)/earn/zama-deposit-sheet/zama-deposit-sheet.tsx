"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AnimatePresence, AnimatePresence, motion, motion } from "motion/react";
import { useMemo } from "react";
import { FiAlertTriangle, FiAlertTriangle, FiCheck, FiCheck, FiLoader, FiLoader, FiX, FiX } from "react-icons/fi";
import { HiLockClosed, HiLockClosed } from "react-icons/hi2";
import { parseUnits } from "viem";
import { useAccount, useAccount, useChainId, useChainId, useConfig, useConfig, useSwitchChain, useSwitchChain } from "wagmi";
import { useWalletReady, useWalletReady } from "@/lib/wallet-ready";
import { useZamaDepositStore, useZamaDepositStore } from "@/stores";

export function ZamaDepositSheet() {
  const open = useZamaDepositStore((state) => state.open);
  const closeSheet = useZamaDepositStore((state) => state.closeSheet);
  const ready = useWalletReady();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeSheet}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:p-6"
        >
          <motion.div
            key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] overflow-hidden rounded-t-3xl border border-main bg-surface sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-main px-5 py-4">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand">
                    <HiLockClosed className="h-2 w-2 text-white" />
                  </span>
                  Zama FHE · Confidential
                </div>
                <h3 className="text-base font-semibold text-main">
                  Confirm your deposit
                </h3>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                aria-label="Close"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-surface-raised text-muted transition-colors hover:bg-surface-muted hover:text-main"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 pb-5 pt-4">
              {ready ? <ZamaDepositBody /> : <LoadingState />}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-10">
      <FiLoader className="h-5 w-5 animate-spin text-brand" />
    </div>
  );
}

function ZamaDepositBody() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal, mounted }) => (
          <button
            type="button"
            disabled={!mounted}
            onClick={openConnectModal}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white cursor-pointer transition-all hover-brand active:scale-[0.98] disabled:opacity-50"
          >
            Connect wallet to continue
          </button>
        )}
      </ConnectButton.Custom>
    );
  }

  return <ZamaDepositFlow walletAddress={address} />;
}

function ZamaDepositFlow({ walletAddress }: { walletAddress: `0x${string}` }) {
  const vault = useZamaDepositStore((state) => state.vault)!;
  const token = useZamaDepositStore((state) => state.token)!;
  const amount = useZamaDepositStore((state) => state.amount);
  const step = useZamaDepositStore((state) => state.step);
  const error = useZamaDepositStore((state) => state.error);
  const txHash = useZamaDepositStore((state) => state.txHash);
  const closeSheet = useZamaDepositStore((state) => state.closeSheet);
  const executeDeposit = useZamaDepositStore((state) => state.executeDeposit);
  const wagmiConfig = useConfig();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const isWrongChain = currentChainId !== 11155111;

  if (step === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 18 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(64,182,107,0.15)]"
        >
          <FiCheck className="h-7 w-7 text-(--color-positive)" />
        </motion.div>
        <div>
          <p className="text-base font-semibold text-main">
            Deposit successful
          </p>
          <p className="mt-1 text-xs text-muted">
            {amount} {vault.symbol.replace("-Vault", "")} deposited into{" "}
            {vault.name}
          </p>
        </div>
        {txHash ? (
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand hover:underline"
          >
            View on Etherscan
          </a>
        ) : null}
        <button
          type="button"
          onClick={closeSheet}
          className="mt-2 w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white cursor-pointer transition-colors hover-brand"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <FiAlertTriangle className="h-6 w-6 text-(--color-negative)" />
        <p className="text-sm font-semibold text-main">Deposit failed</p>
        <p className="mx-auto max-w-xs text-xs text-muted">{error}</p>
        <button
          type="button"
          onClick={() =>
            useZamaDepositStore.setState({ step: "idle", error: null })
          }
          className="mt-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white cursor-pointer transition-colors hover-brand"
        >
          Try again
        </button>
      </div>
    );
  }

  const isExecuting =
    step === "approving" || step === "approved" || step === "depositing";

  const stepLabel: Record<string, string> = {
    approving: "Approving token spend…",
    approved: "Ready to deposit…",
    depositing: "Depositing into vault…",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-main bg-surface-raised px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Vault</span>
          <span className="text-sm font-semibold text-main">{vault.name}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted">Amount</span>
          <span className="text-sm font-semibold text-main">
            {amount} {vault.symbol.replace("-Vault", "")}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted">APY</span>
          <span className="text-sm font-semibold text-[#60a5fa]">
            {vault.apy.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted">Protocol</span>
          <span className="flex items-center gap-1 text-sm font-semibold text-main">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand">
              <HiLockClosed className="h-2 w-2 text-white" />
            </span>
            Zama FHE
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-[rgba(64,182,107,0.08)] px-4 py-3 text-xs text-[#a0aacc]">
        Your deposit balance is encrypted on-chain via Fully Homomorphic
        Encryption. All transactions remain private using Zama fhEVM.
      </div>

      {isExecuting ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <FiLoader className="h-5 w-5 animate-spin text-brand" />
          <p className="text-sm font-semibold text-main">
            {stepLabel[step] ?? "Processing…"}
          </p>
          <p className="text-xs text-muted">Please confirm in your wallet</p>
        </div>
      ) : isWrongChain ? (
        <button
          type="button"
          onClick={() => switchChainAsync({ chainId: 11155111 })}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white cursor-pointer transition-all hover-brand active:scale-[0.98]"
        >
          Switch to Sepolia
        </button>
      ) : (
        <button
          type="button"
          onClick={() => executeDeposit(wagmiConfig, walletAddress)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-base font-semibold text-white cursor-pointer transition-all hover-brand active:scale-[0.98]"
        >
          <HiLockClosed className="h-4 w-4" />
          Confirm FHE deposit
        </button>
      )}
    </div>
  );
}
