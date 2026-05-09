import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import * as viemChains from "viem/chains";

const allChains = Object.values(viemChains).filter(
  (value): value is (typeof viemChains)[keyof typeof viemChains] =>
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value,
);

const [primary, ...rest] = allChains.sort((a, b) => {
  const priority = [42161, 421614, 143, 8453, 10, 1, 137];
  const ai = priority.indexOf(a.id);
  const bi = priority.indexOf(b.id);
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== -1) return -1;
  if (bi !== -1) return 1;
  return a.name.localeCompare(b.name);
});

export function createWagmiConfig(projectId: string) {
  return getDefaultConfig({
    appName: "zMAAI",
    appDescription: "Find the best yield route across DeFi",
    projectId,
    chains: [primary, ...rest],
    ssr: true,
  });
}
