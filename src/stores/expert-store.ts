import { create } from "zustand";
type FetchStatus = "idle" | "loading" | "success" | "error";

export type VaultRiskFilter = "low" | "medium" | "high" | "all";

type ExpertState = {
  token: { symbol: string; name: string; usdPrice: number };
  chain: { id: number; name: string; shortName: string };
  amount: string;
  vaults: import("@/types").VaultStrategy[];
  selectedVaultId: string | null;
  pendingVaultId: string | null;
  sortBy: "apy" | "tvl";
  status: FetchStatus;
  error: string | null;
  showOnlyTransactional: boolean;
  riskFilter: VaultRiskFilter;
  protocolFilter: string | null;
  apyMinFilter: number | null;
  tvlMinFilter: number | null;
  setToken: (token: { symbol: string; name: string; usdPrice: number }) => void;
  setChain: (chain: { id: number; name: string; shortName: string }) => void;
  setAmount: (value: string) => void;
  setSortBy: (sortBy: "apy" | "tvl") => void;
  setShowOnlyTransactional: (value: boolean) => void;
  setRiskFilter: (filter: VaultRiskFilter) => void;
  setProtocolFilter: (protocolKey: string | null) => void;
  setApyMinFilter: (value: number | null) => void;
  setTvlMinFilter: (value: number | null) => void;
  selectVault: (id: string) => void;
  setPendingVaultId: (id: string | null) => void;
  fetchVaults: () => Promise<void>;
};

let currentController: AbortController | null = null;

export const useExpertStore = create<ExpertState>((set, _get) => ({
  token: { symbol: "fUSDC", name: "FHE USDC", usdPrice: 1 },
  chain: { id: 11155111, name: "Ethereum Sepolia", shortName: "Sepolia" },
  amount: "",
  vaults: [],
  selectedVaultId: null,
  pendingVaultId: null,
  sortBy: "apy",
  status: "idle",
  error: null,
  showOnlyTransactional: false,
  riskFilter: "all",
  protocolFilter: null,
  apyMinFilter: null,
  tvlMinFilter: null,
  setToken: (token) => set({ token }),
  setChain: (chain) => set({ chain }),
  setAmount: (amount) => {
    const parsed = Number.parseFloat(amount || "0");
    const valid = Number.isFinite(parsed) && parsed > 0;
    set(valid ? { amount } : { amount, selectedVaultId: null, vaults: [] });
  },
  setSortBy: (sortBy) => set({ sortBy }),
  setShowOnlyTransactional: (showOnlyTransactional) =>
    set({ showOnlyTransactional }),
  setRiskFilter: (riskFilter) => set({ riskFilter }),
  setProtocolFilter: (protocolFilter) => set({ protocolFilter }),
  setApyMinFilter: (apyMinFilter) => set({ apyMinFilter }),
  setTvlMinFilter: (tvlMinFilter) => set({ tvlMinFilter }),
  selectVault: (selectedVaultId) => set({ selectedVaultId }),
  setPendingVaultId: (pendingVaultId) => set({ pendingVaultId }),
  fetchVaults: async () => {
    if (currentController) {
      currentController.abort();
    }
    const controller = new AbortController();
    currentController = controller;

    set({ status: "loading", error: null });

    try {
      const response = await fetch("/api/zama/vaults?chainId=11155111", {
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      const data = await response.json();
      const vaults: import("@/types").VaultStrategy[] = (data.data ?? []).map(
        (v: import("@/lib/zama-sdk").ZamaVault) => ({
          id: v.address,
          protocol: "Zama FHE",
          protocolKey: "zama-fhe",
          protocolLogoUri: undefined,
          protocolUrl: undefined,
          vaultName: v.name,
          vaultAddress: v.address,
          tokenSymbol: v.symbol.replace("-Vault", ""),
          tokenAddress: v.asset,
          tokenDecimals: v.decimals,
          chainId: 11155111,
          chainShortName: "Sepolia",
          apy: v.apy,
          apy30d: null,
          tvlUsd: Number.parseFloat(v.tvl),
          risk: "medium" as const,
          isTransactional: true,
          isRedeemable: true,
          kyc: false,
          timeLock: 0,
          tags: ["FHE", "Confidential"],
        }),
      );

      set({
        vaults,
        selectedVaultId: vaults[0]?.id ?? null,
        pendingVaultId: null,
        status: "success",
        error: null,
        protocolFilter: null,
        apyMinFilter: null,
        tvlMinFilter: null,
      });
    } catch (err) {
      if ((err as DOMException).name === "AbortError") return;
      set({
        status: "error",
        error: "We couldn't load vaults right now. Please try again.",
      });
    }
  },
}));
