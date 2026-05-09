"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { EarnBackground } from "./earn-background";
import { EarnQueryHydrator } from "./earn-query-hydrator";
import { StrategyPreview } from "./strategy-preview";
import { StrategyReview } from "./strategy-review";
import { SupplyCard } from "./supply-card";
import { VaultList } from "./vault-list";

const ZamaDepositSheet = dynamic(
  () =>
    import("./zama-deposit-sheet/zama-deposit-sheet").then(
      (m) => m.ZamaDepositSheet,
    ),
  { ssr: false },
);

export function EarnView() {
  return (
    <>
      <EarnBackground />
      <Suspense fallback={null}>
        <EarnQueryHydrator />
      </Suspense>
      <main className="mx-auto flex w-full max-w-310 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 lg:h-[calc(100dvh-4rem)] lg:flex-none lg:overflow-hidden">
        <div className="grid flex-1 gap-4 lg:min-h-0 lg:grid-cols-2 lg:gap-5 lg:items-stretch">
          <div className="flex min-h-0 flex-col gap-4">
            <SupplyCard />
            <StrategyReview />
            <StrategyPreview />
          </div>
          <div className="flex min-h-0 flex-col">
            <VaultList />
          </div>
        </div>
      </main>
      <ZamaDepositSheet />
    </>
  );
}
