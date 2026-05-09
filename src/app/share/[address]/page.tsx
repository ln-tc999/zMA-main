import type { Metadata } from "next";
import { redirect } from "next/navigation";

const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const LIFI_EARN_API_BASE_URL =
  process.env.LIFI_EARN_API_BASE_URL ?? "https://earn.li.fi/v1";
const LIFI_PORTFOLIO_URL = `${LIFI_EARN_API_BASE_URL}/portfolio`;

type Props = {
  params: Promise<{ address: string }>;
};

async function fetchPositions(address: string) {
  const apiKey = process.env.LIFI_API_KEY;
  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["x-lifi-api-key"] = apiKey;

  try {
    const res = await fetch(`${LIFI_PORTFOLIO_URL}/${address}/positions`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.positions ?? [];
  } catch {
    return [];
  }
}

function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "$0.00";
  if (value < 0.01) return "< $0.01";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  if (!ADDRESS_PATTERN.test(address)) {
    return { title: "zMAAI" };
  }

  const positions = await fetchPositions(address);
  const totalUsd = positions.reduce(
    (sum: number, p: { balanceUsd?: string }) =>
      sum + Number.parseFloat(p.balanceUsd ?? "0"),
    0,
  );
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const title = `${short} is earning ${formatUsd(totalUsd)} on zMAAI`;
  const description = `${positions.length} active vault${positions.length === 1 ? "" : "s"} across DeFi. Best yield, one click.`;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://yieldo-earn.vercel.app";

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "zMAAI",
      url: `${baseUrl}/share/${address}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharePage({ params }: Props) {
  await params;
  redirect(`/portfolio`);
}
