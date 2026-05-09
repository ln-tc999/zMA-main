import { NextResponse } from "next/server";
import type { ZamaVault } from "@/lib/zama-sdk";

const MOCK_VAULTS: ZamaVault[] = [
  {
    address: "0x0000000000000000000000000000000000000002",
    name: "FHE USDC Vault",
    symbol: "fUSDC-Vault",
    asset: "0x0000000000000000000000000000000000000001",
    decimals: 18,
    tvl: "1250000.50",
    apy: 5.7,
    isConfidential: true,
  },
  {
    address: "0x0000000000000000000000000000000000000003",
    name: "FHE ETH Vault",
    symbol: "fETH-Vault",
    asset: "0x0000000000000000000000000000000000000004",
    decimals: 18,
    tvl: "890000.25",
    apy: 4.2,
    isConfidential: true,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chainId = searchParams.get("chainId") || "11155111";

  return NextResponse.json({
    data: MOCK_VAULTS,
    total: MOCK_VAULTS.length,
    chainId: Number(chainId),
    nextCursor: null,
  });
}
