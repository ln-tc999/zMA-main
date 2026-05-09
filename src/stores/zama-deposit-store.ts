import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { parseUnits } from "viem";
import type { Config } from "wagmi";
import { create } from "zustand";
import { ERC20_ABI, type ZamaVault } from "@/lib/zama-sdk";

export type DepositStep =
  | "idle"
  | "approving"
  | "approved"
  | "depositing"
  | "success"
  | "error";

type DepositState = {
  open: boolean;
  vault: ZamaVault | null;
  token: { address: string; symbol: string; decimals: number } | null;
  amount: string;
  step: DepositStep;
  error: string | null;
  txHash: string | null;
  openSheet: (
    vault: ZamaVault,
    token: { address: string; symbol: string; decimals: number },
    amount: string,
  ) => void;
  closeSheet: () => void;
  setAmount: (amount: string) => void;
  executeDeposit: (config: Config, account: `0x${string}`) => Promise<void>;
  reset: () => void;
};

export const useZamaDepositStore = create<DepositState>((set, get) => ({
  open: false,
  vault: null,
  token: null,
  amount: "",
  step: "idle",
  error: null,
  txHash: null,

  openSheet: (vault, token, amount) => {
    set({
      open: true,
      vault,
      token,
      amount,
      step: "idle",
      error: null,
      txHash: null,
    });
  },

  closeSheet: () => set({ open: false }),

  setAmount: (amount) => set({ amount, step: "idle", error: null }),

  reset: () =>
    set({
      open: false,
      vault: null,
      token: null,
      amount: "",
      step: "idle",
      error: null,
      txHash: null,
    }),

  executeDeposit: async (config, account) => {
    const { vault, token, amount } = get();
    if (!vault || !token || !amount) {
      set({ step: "error", error: "Missing deposit context" });
      return;
    }

    try {
      const amountBigInt = parseUnits(amount, token.decimals);

      set({ step: "approving", error: null });

      const allowance = (await readContract(config, {
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [account, vault.address as `0x${string}`],
      })) as bigint;

      if (allowance < amountBigInt) {
        const approveHash = await writeContract(config, {
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [vault.address as `0x${string}`, amountBigInt],
        });
        await waitForTransactionReceipt(config, { hash: approveHash });
      }

      set({ step: "approved" });

      set({ step: "depositing" });

      const depositHash = await writeContract(config, {
        address: vault.address as `0x${string}`,
        abi: [
          {
            name: "deposit",
            type: "function",
            inputs: [
              { name: "assets", type: "uint256" },
              { name: "receiver", type: "address" },
            ],
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "deposit",
        args: [amountBigInt, account],
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: depositHash,
      });

      set({ txHash: receipt.transactionHash, step: "success" });
    } catch (error) {
      const message = (error as Error).message || "Deposit failed";
      set({
        step: "error",
        error: message.includes("user rejected")
          ? "Transaction rejected in wallet."
          : message.slice(0, 160),
      });
    }
  },
}));
