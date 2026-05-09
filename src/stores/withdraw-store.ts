import {
  readContract,
  waitForTransactionReceipt,
  sendTransaction,
} from "@wagmi/core";
import { encodeFunctionData, erc20Abi } from "viem";
import type { Config } from "wagmi";
import { create } from "zustand";
import type { LifiQuoteResponse } from "@/lib/lifi-quote";
import type { LifiPortfolioPosition } from "@/lib/lifi-portfolio";
import { getTrackedVaults, type TrackedVault } from "@/lib/tracked-vaults";

export type WithdrawStep =
  | "idle"
  | "quoting"
  | "ready"
  | "executing"
  | "success"
  | "error";

const ERC4626_ABI = [
  {
    name: "redeem",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ name: "assets", type: "uint256" }],
  },
  {
    name: "previewRedeem",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "assets", type: "uint256" }],
  },
  {
    name: "asset",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;

export const ERC4626_REDEEM_TOOL = "erc4626-redeem";

function friendlyWithdrawError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("vault_not_tracked")) {
    return "We can't withdraw this position automatically. Please withdraw directly from the protocol's app, then it will disappear from here.";
  }
  if (
    lower.includes("function does not exist") ||
    lower.includes('function "asset" reverted') ||
    lower.includes('function "balanceof" reverted') ||
    lower.includes('function "previewredeem" reverted') ||
    lower.includes("returned no data") ||
    lower.includes("invalid opcode")
  ) {
    return "This vault doesn't expose a standard ERC-4626 interface. Withdraw directly from the protocol's app for now.";
  }
  if (lower.includes("user rejected")) {
    return "Transaction was rejected in your wallet.";
  }
  return raw.length > 160 ? `${raw.slice(0, 160)}…` : raw;
}

function findTrackedVault(
  position: LifiPortfolioPosition,
): TrackedVault | undefined {
  const vaults = getTrackedVaults();
  const targetProtocol = position.protocolName.toLowerCase();
  return vaults.find(
    (vault) =>
      vault.chainId === position.chainId &&
      vault.protocolName.toLowerCase() === targetProtocol,
  );
}

type WithdrawState = {
  open: boolean;
  position: LifiPortfolioPosition | null;
  percentage: number;
  quote: LifiQuoteResponse | null;
  step: WithdrawStep;
  error: string | null;
  txHash: string | null;
  openSheet: (position: LifiPortfolioPosition) => void;
  closeSheet: () => void;
  setPercentage: (percentage: number) => void;
  fetchQuote: (fromAddress: string, config: Config) => Promise<void>;
  executeWithdraw: (config: Config, fromAddress: string) => Promise<void>;
  setStep: (step: WithdrawStep) => void;
  setError: (error: string | null) => void;
  setTxHash: (txHash: string | null) => void;
};

let quoteController: AbortController | null = null;

function applyPercentage(
  balanceNative: string,
  percentage: number,
  decimals: number,
): string {
  try {
    const raw = balanceNative || "0";
    const balance = raw.includes(".") ? toBigInt(raw, decimals) : BigInt(raw);
    if (balance === 0n) return "0";
    const pct = BigInt(Math.max(1, Math.min(100, percentage)));
    return ((balance * pct) / 100n).toString();
  } catch {
    return "0";
  }
}

function toBigInt(decimal: string, decimals: number): bigint {
  const [whole = "0", frac = ""] = decimal.split(".");
  const trimmed = frac.slice(0, decimals).padEnd(decimals, "0");
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(trimmed);
}

export const useWithdrawStore = create<WithdrawState>((set, get) => ({
  open: false,
  position: null,
  percentage: 100,
  quote: null,
  step: "idle",
  error: null,
  txHash: null,
  openSheet: (position) => {
    if (quoteController) {
      quoteController.abort();
      quoteController = null;
    }
    set({
      open: true,
      position,
      percentage: 100,
      quote: null,
      step: "idle",
      error: null,
      txHash: null,
    });
  },
  closeSheet: () => {
    if (quoteController) {
      quoteController.abort();
      quoteController = null;
    }
    set({ open: false });
  },
  setPercentage: (percentage) => {
    set({ percentage, quote: null, step: "idle", error: null });
  },
  fetchQuote: async (fromAddress, config) => {
    const { position, percentage } = get();
    if (!position) {
      set({ step: "error", error: "No position selected" });
      return;
    }

    const fromAmount = applyPercentage(
      position.balanceNative,
      percentage,
      position.asset.decimals,
    );
    if (fromAmount === "0") {
      set({
        step: "error",
        error: "Nothing to withdraw at this percentage.",
      });
      return;
    }

    if (quoteController) {
      quoteController.abort();
    }
    const controller = new AbortController();
    quoteController = controller;

    set({ step: "quoting", error: null });

    try {
      const tracked = findTrackedVault(position);
      if (!tracked) {
        throw new Error("vault_not_tracked");
      }

      const vaultAddress = tracked.vaultAddress as `0x${string}`;
      const chainId = position.chainId;
      const owner = fromAddress as `0x${string}`;

      const sharesBalanceRaw = await readContract(config, {
        address: vaultAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [owner],
        chainId,
      });
      if (controller.signal.aborted) return;
      const sharesBalance = sharesBalanceRaw as bigint;
      if (sharesBalance === 0n) {
        throw new Error("No vault shares to withdraw.");
      }

      const pct = BigInt(Math.max(1, Math.min(100, percentage)));
      const shares = (sharesBalance * pct) / 100n;
      if (shares === 0n) {
        throw new Error("Nothing to withdraw at this percentage.");
      }

      let underlyingAddress: `0x${string}` | undefined = tracked.tokenAddress as
        | `0x${string}`
        | undefined;
      if (!underlyingAddress) {
        const fetched = await readContract(config, {
          address: vaultAddress,
          abi: ERC4626_ABI,
          functionName: "asset",
          chainId,
        });
        underlyingAddress = fetched as `0x${string}`;
      }
      if (controller.signal.aborted) return;

      const previewedAssetsRaw = await readContract(config, {
        address: vaultAddress,
        abi: ERC4626_ABI,
        functionName: "previewRedeem",
        args: [shares],
        chainId,
      });
      if (controller.signal.aborted) return;
      const previewedAssets = previewedAssetsRaw as bigint;

      const calldata = encodeFunctionData({
        abi: ERC4626_ABI,
        functionName: "redeem",
        args: [shares, owner, owner],
      });

      const slippageBps = 50n;
      const minAssets = (previewedAssets * (10_000n - slippageBps)) / 10_000n;

      const quote: LifiQuoteResponse = {
        id: "local-redeem",
        type: "lifi",
        tool: ERC4626_REDEEM_TOOL,
        action: {
          fromChainId: chainId,
          toChainId: chainId,
          fromToken: {
            address: vaultAddress,
            symbol: tracked.vaultName || position.asset.symbol,
            decimals: position.asset.decimals,
            chainId,
          },
          toToken: {
            address: underlyingAddress,
            symbol: tracked.tokenSymbol,
            decimals: tracked.tokenDecimals,
            chainId,
          },
          fromAmount: shares.toString(),
          slippage: 0.005,
          fromAddress,
          toAddress: fromAddress,
        },
        estimate: {
          fromAmount: shares.toString(),
          toAmount: previewedAssets.toString(),
          toAmountMin: minAssets.toString(),
          executionDuration: 0,
        },
        transactionRequest: {
          to: vaultAddress,
          data: calldata,
          value: "0",
          chainId,
        },
      };

      set({ quote, step: "ready", error: null });
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      const raw = (error as Error).message || "Failed to prepare withdrawal";
      set({ step: "error", error: friendlyWithdrawError(raw) });
    }
  },
  setStep: (step) => set({ step }),
  setError: (error) => set({ error }),
  setTxHash: (txHash) => set({ txHash }),
  executeWithdraw: async (config, _fromAddress) => {
    const { quote, position } = get();
    if (!quote || !position) {
      set({ step: "error", error: "No quote available" });
      return;
    }

    const { transactionRequest } = quote;
    if (!transactionRequest) {
      set({ step: "error", error: "Invalid quote" });
      return;
    }

    try {
      set({ step: "executing", error: null });

      const hash = await sendTransaction(config, {
        to: transactionRequest.to as `0x${string}`,
        data: transactionRequest.data as `0x${string}`,
        value: transactionRequest.value
          ? BigInt(transactionRequest.value)
          : undefined,
        chainId: quote.action.fromChainId,
      });

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "success") {
        set({ step: "success", txHash: hash, error: null });
      } else {
        set({ step: "error", error: "Transaction failed on-chain" });
      }
    } catch (err) {
      if ((err as Error).name === "UserRejectedRequestError") {
        set({ step: "idle" });
        return;
      }
      set({
        step: "error",
        error: (err as Error).message || "Withdrawal failed",
      });
    }
  },
}));
