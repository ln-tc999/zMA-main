"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { HiOutlineWallet } from "react-icons/hi2";
import { motion } from "motion/react";

export function ConnectPromptCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-4 rounded-3xl border border-main bg-surface px-6 py-16 text-center "
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <HiOutlineWallet className="h-6 w-6" />
      </div>
      <div className="max-w-md">
        <h2 className="text-xl font-semibold tracking-tight text-main">
          Connect your wallet to view your portfolio
        </h2>
        <p className="mt-2 text-sm text-muted">
          zMAAI reads real balances and earn positions directly from the
          connected wallet across every supported network — we never hold your
          funds.
        </p>
      </div>
      <ConnectButton.Custom>
        {({ openConnectModal, mounted }) => (
          <button
            type="button"
            onClick={openConnectModal}
            disabled={!mounted}
            className="cursor-pointer rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover-brand disabled:opacity-60"
          >
            Connect wallet
          </button>
        )}
      </ConnectButton.Custom>
    </motion.section>
  );
}
