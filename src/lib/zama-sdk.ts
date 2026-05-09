import { createInstance, FhevmInstance } from "fhevm";
import type { Config } from "wagmi";

export interface ZamaConfig {
  gatewayUrl: string;
  networkChainId: number;
}

const ZAMA_GATEWAY = {
  11155111: "https://gateway.testnet.zama.ai",
  1: "https://gateway.zama.ai",
} as const;

export function getZamaGateway(chainId: number): string {
  return (
    ZAMA_GATEWAY[chainId as keyof typeof ZAMA_GATEWAY] || ZAMA_GATEWAY[11155111]
  );
}

let fhevmInstance: FhevmInstance | null = null;

export async function getFhevmInstance(
  publicKey: string,
  gatewayUrl?: string,
): Promise<FhevmInstance> {
  if (fhevmInstance) return fhevmInstance;

  const instance = createInstance({
    gatewayUrl: gatewayUrl || getZamaGateway(11155111),
  });

  await instance.initialize();
  fhevmInstance = instance;
  return instance;
}

export function decryptUint256(
  instance: FhevmInstance,
  encrypted: string,
): bigint {
  try {
    const decrypted = instance.decrypt("uint256", encrypted);
    return BigInt(decrypted);
  } catch {
    return 0n;
  }
}

export function encryptAmount(
  instance: FhevmInstance,
  amount: bigint,
  type: "uint256" | "uint128" | "uint64" = "uint256",
): string {
  try {
    return instance.encrypt(type, amount.toString());
  } catch {
    return "0";
  }
}

export interface ZamaVault {
  address: string;
  name: string;
  symbol: string;
  asset: string;
  decimals: number;
  tvl: string;
  apy: number;
  isConfidential: true;
}

export interface ZamaToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  priceUSD?: string;
  isConfidential: boolean;
}

export const ZAMA_CONTRACTS = {
  FHEUSDC: "0x0000000000000000000000000000000000000000",
  FHEVAULT: "0x0000000000000000000000000000000000000000",
} as const;

export function setZamaContracts(usdc: string, vault: string) {
  ZAMA_CONTRACTS.FHEUSDC = usdc;
  ZAMA_CONTRACTS.FHEVAULT = vault;
}

export const FHE_ABI = [
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
  {
    name: "withdraw",
    type: "function",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    name: "asset",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    name: "totalAssets",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    name: "symbol",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
] as const;
