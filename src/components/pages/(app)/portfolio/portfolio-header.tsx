"use client";

import Image from "next/image";
import { useState } from "react";
import { FiCheck, FiCopy, FiShare2 } from "react-icons/fi";

function shorten(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

type PortfolioHeaderProps = {
  address: string | null;
  right?: React.ReactNode;
  onShareClick?: () => void;
};

export function PortfolioHeader({
  address,
  right,
  onShareClick,
}: PortfolioHeaderProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch { }
  }

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-brand-soft">
          <Image
            src="/Assets/Images/Logo-Brand/logo-transparent.png"
            alt="zMAAI"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
            Portfolio
          </span>
          {address ? (
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 cursor-pointer text-left"
              title="Copy address"
            >
              <span className="text-lg font-semibold tracking-tight text-main">
                {shorten(address)}
              </span>
              {copied ? (
                <FiCheck className="h-3.5 w-3.5 text-brand" />
              ) : (
                <FiCopy className="h-3.5 w-3.5 text-muted transition-colors hover:text-main" />
              )}
            </button>
          ) : (
            <span className="text-lg font-semibold tracking-tight text-main">
              Connect to view
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {address && onShareClick ? (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-surface-raised px-4 py-2 text-xs font-semibold text-main cursor-pointer transition-colors hover:bg-surface-muted"
            onClick={onShareClick}
          >
            <FiShare2 className="h-3.5 w-3.5" />
            Share
          </button>
        ) : null}
        {right}
      </div>
    </header>
  );
}
