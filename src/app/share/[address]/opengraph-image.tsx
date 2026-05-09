import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "zMAAI Earn Positions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LIFI_EARN_API_BASE_URL =
  process.env.LIFI_EARN_API_BASE_URL ?? "https://earn.li.fi/v1";
const LIFI_PORTFOLIO_URL = `${LIFI_EARN_API_BASE_URL}/portfolio`;
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

type Position = {
  chainId: number;
  protocolName: string;
  asset: { symbol: string };
  balanceUsd?: string;
};

function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "$0.00";
  if (value < 0.01) return "< $0.01";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

async function fetchPositions(address: string): Promise<Position[]> {
  const apiKey = process.env.LIFI_API_KEY;
  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["x-lifi-api-key"] = apiKey;

  try {
    const res = await fetch(`${LIFI_PORTFOLIO_URL}/${address}/positions`, {
      headers,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.positions ?? [];
  } catch {
    return [];
  }
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;

  if (!ADDRESS_PATTERN.test(address)) {
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d0e0f",
          color: "#fff",
          fontSize: 40,
          fontWeight: 700,
        }}
      >
        zMAAI
      </div>,
      { ...size },
    );
  }

  const positions = await fetchPositions(address);
  const totalUsd = positions.reduce(
    (sum, p) => sum + Number.parseFloat(p.balanceUsd ?? "0"),
    0,
  );
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const top = positions.slice(0, 4);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#0d0e0f",
        padding: 60,
        gap: 32,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: "rgba(30,64,175,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              color: "#60a5fa",
            }}
          >
            Y
          </div>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            zMAAI
          </span>
        </div>
        <span
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: "#6b6b75",
          }}
        >
          {short}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "#6b6b75",
          }}
        >
          Earning across DeFi
        </span>
        <span
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {formatUsd(totalUsd)}
        </span>
        <span
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: "#6b6b75",
            marginTop: 4,
          }}
        >
          in {positions.length} active vault
          {positions.length === 1 ? "" : "s"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          flex: 1,
        }}
      >
        {top.map((position, index) => {
          const usd = Number.parseFloat(position.balanceUsd ?? "0");
          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                backgroundColor: "rgba(27,27,31,0.9)",
                borderRadius: 20,
                padding: "16px 24px",
                border: "1px solid #2c2c31",
                flex: "1 1 45%",
                minWidth: 460,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    backgroundColor: "rgba(30,64,175,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#60a5fa",
                  }}
                >
                  {position.protocolName.charAt(0).toUpperCase()}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#ffffff",
                    }}
                  >
                    {position.protocolName}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#6b6b75",
                    }}
                  >
                    {position.asset.symbol}
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                {formatUsd(usd)}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #2c2c31",
          paddingTop: 20,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#6b6b75",
          }}
        >
          Earn with zMAAI
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#6b6b75",
          }}
        >
          Powered by Zama FHE
        </span>
      </div>
    </div>,
    { ...size },
  );
}
