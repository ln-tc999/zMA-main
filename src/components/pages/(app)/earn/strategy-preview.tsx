"use client";

import Image from "next/image";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useExpertStore } from "@/stores";

const PREVIEW_FEATURES = ["Live APY + TVL", "Risk tier", "One-click route"];

export function StrategyPreview() {
  const amount = useExpertStore((state) => state.amount);
  const parsed = Number.parseFloat(amount || "0");
  const hasValidAmount = Number.isFinite(parsed) && parsed > 0;

  if (hasValidAmount) {
    return null;
  }

  return (
    <section className="relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-main bg-surface p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(30,64,175,0.18),transparent_55%)]" />

      <div className="relative flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-brand-soft">
          <Image
            src="/Assets/Images/Logo-Brand/logo-transparent.png"
            alt="zMAAI"
            width={20}
            height={20}
            className="h-5 w-5 object-contain rounded-full"
          />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">
          Strategy preview
        </span>
      </div>

      <div className="relative flex flex-col gap-1">
        <h3 className="max-w-[28ch] text-base font-semibold leading-tight text-main">
          Your yield route will land here
        </h3>
        <p className="text-[11px] text-muted">
          Enter an amount to stream the selected vault details live — powered by
          Nox Protocol.
        </p>
      </div>

      <div className="relative mt-auto flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {PREVIEW_FEATURES.map((feature) => (
            <span
              key={feature}
              className="flex items-center gap-1 text-[10px] font-medium text-muted"
            >
              <FiCheckCircle className="h-3 w-3 text-brand" />
              {feature}
            </span>
          ))}
        </div>
        <a
          href="https://docs.li.fi/earn/overview"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-brand"
        >
          How it works
          <FiArrowRight className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}
