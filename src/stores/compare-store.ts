import { create } from "zustand";
import type { VaultStrategy } from "@/types";
import type { ZamaVault } from "@/lib/zama-sdk";

export const COMPARE_MAX_SLOTS = 4;

type CompareState = {
  selectedVaults: VaultStrategy[];
  pickerOpen: boolean;
  searchChainId: number;
  searchQuery: string;
  searchResults: VaultStrategy[];
  searchStatus: "idle" | "loading" | "ready" | "error";
  openPicker: () => void;
  closePicker: () => void;
  setSearchChain: (chainId: number | null) => void;
  setSearchQuery: (query: string) => void;
  searchVaults: () => Promise<void>;
  addVault: (vault: VaultStrategy) => void;
  removeVault: (id: string) => void;
  clearAll: () => void;
};

function mapZamaVault(v: ZamaVault): VaultStrategy {
  return {
    id: v.address,
    protocol: "Zama FHE",
    protocolKey: "zama-fhe",
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
    protocolLogoUri: undefined,
    protocolUrl: undefined,
  };
}

let searchController: AbortController | null = null;

export const useCompareStore = create<CompareState>((set, get) => ({
  selectedVaults: [],
  pickerOpen: false,
  searchChainId: 11155111,
  searchQuery: "",
  searchResults: [],
  searchStatus: "idle",
  openPicker: () => {
    set({ pickerOpen: true });
    if (get().searchResults.length === 0) {
      get().searchVaults();
    }
  },
  closePicker: () => set({ pickerOpen: false }),
  setSearchChain: (searchChainId) => {
    set({ searchChainId: searchChainId ?? 11155111, searchResults: [] });
    get().searchVaults();
  },
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  searchVaults: async () => {
    const { searchChainId, searchQuery } = get();

    if (searchController) searchController.abort();
    const controller = new AbortController();
    searchController = controller;

    set({ searchStatus: "loading" });

    try {
      const url = `/api/zama/vaults?chainId=${searchChainId}`;
      const response = await fetch(url, { signal: controller.signal });
      if (controller.signal.aborted) return;

      const data = await response.json();
      const vaults: VaultStrategy[] = (data.data ?? []).map(mapZamaVault);
      const filtered = searchQuery.trim()
        ? vaults.filter(
            (v) =>
              v.vaultName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              v.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : vaults;

      set({ searchResults: filtered, searchStatus: "ready" });
    } catch (err) {
      if ((err as DOMException).name !== "AbortError") {
        set({ searchStatus: "error", searchResults: [] });
      }
    }
  },
  addVault: (vault) => {
    set((state) => {
      if (state.selectedVaults.length >= COMPARE_MAX_SLOTS) return state;
      if (state.selectedVaults.some((v) => v.id === vault.id)) return state;
      return {
        selectedVaults: [...state.selectedVaults, vault],
        pickerOpen: false,
      };
    });
  },
  removeVault: (id) =>
    set((state) => ({
      selectedVaults: state.selectedVaults.filter((v) => v.id !== id),
    })),
  clearAll: () => set({ selectedVaults: [] }),
}));
