import Image from "next/image";
import { FiArrowLeft } from "react-icons/fi";
import { type FeatureSections } from "@/components/ui";

export function IdleAggregatorCard() {
  return (
    <section className="relative flex h-[62%] flex-col overflow-hidden rounded-3xl border border-main bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
          <Image
            src="/Assets/Images/Logo-Brand/logo-transparent.png"
            alt="zMAAI"
            width={18}
            height={18}
            className="h-4 w-4 object-contain"
          />
          zMAAI Aggregator · Arbitrum-first
        </span>
        <h2 className="max-w-[22ch] text-xl font-semibold leading-tight tracking-tight text-main sm:text-2xl">
          Best yield on Arbitrum, aggregated live.
        </h2>
        <p className="max-w-md text-sm text-muted">
          Enter an amount to discover top vault routes on{" "}
          <span className="font-semibold text-main">Arbitrum</span> — streamed
          in real time from{" "}
          <span className="font-semibold text-main">Nox Protocol</span>.
        </p>
      </div>

      <div className="mt-6 flex flex-1 items-center justify-center">
        <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-white/10">
          <Image
            src="/Assets/Images/Logo-Brand/chaingpt.png"
            alt="ChainGPT"
            fill
            className="object-contain p-2"
          />
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-soft px-4 py-2 text-sm font-semibold text-main">
          <FiArrowLeft className="h-4 w-4" />
          Enter an amount to continue
        </div>
        <div className="text-[11px] font-medium tracking-wide text-faint">
          Powered by{" "}
          <span className="font-semibold text-muted">Nox Protocol</span>
        </div>
      </div>
    </section>
  );
}
