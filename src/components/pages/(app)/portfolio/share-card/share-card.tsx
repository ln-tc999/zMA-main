"use client";

import { toPng } from "html-to-image";
import { useCallback, useRef, useState } from "react";
import { FiDownload, FiX } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { AnimatePresence, motion } from "motion/react";
import type { LifiChainMeta } from "@/lib/lifi-meta";
import type { LifiPortfolioPosition } from "@/lib/lifi-portfolio";
import { resolveProtocol } from "@/lib/protocol-registry";
import { formatUsd, shortenAddress } from "./share-card-utils";

type ShareCardProps = {
  open: boolean;
  onClose: () => void;
  address: string;
  totalPositionsUsd: number;
  positions: LifiPortfolioPosition[];
  chainsById: Record<number, LifiChainMeta>;
};

export function ShareCard({
  open,
  onClose,
  address,
  totalPositionsUsd,
  positions,
  chainsById,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  function buildCaption(): string {
    const protocols = [
      ...new Set(
        positions.map((p) => resolveProtocol(p.protocolName).displayName),
      ),
    ];
    const protocolList =
      protocols.length <= 3
        ? protocols.join(", ")
        : `${protocols.slice(0, 3).join(", ")} & more`;
    const lines = [
      `Earning ${formatUsd(totalPositionsUsd)} across ${positions.length} vault${positions.length === 1 ? "" : "s"} on ${protocolList}`,
      "",
      "Best yield, one click. Aggregated live from 20+ DeFi protocols.",
    ];
    return lines.join("\n");
  }

  function handleShareX() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const shareUrl = `${baseUrl}/share/${address}`;
    const text = encodeURIComponent(buildCaption());
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://x.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  const handleExport = useCallback(async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: "#0d0e0f",
      });
      const link = document.createElement("a");
      link.download = "iex-ai-earn.png";
      link.href = dataUrl;
      link.click();
    } catch {
    } finally {
      setExporting(false);
    }
  }, [exporting]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="share-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        >
          <motion.div
            key="share-modal"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-md flex-col gap-4"
          >
            <div
              ref={cardRef}
              className="rounded-3xl overflow-hidden"
              style={{ backgroundColor: "#0d0e0f" }}
            >
              <div
                className="relative flex flex-col gap-5 p-6"
                style={{
                  background:
                    "linear-gradient(165deg, #131316 0%, #0d0e0f 40%, #111118 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src="/Assets/Images/Logo-Brand/logo.png"
                      alt="zMAAI"
                      width={28}
                      height={28}
                      style={{ width: 28, height: 28, objectFit: "contain" }}
                    />
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#fff",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      zMAAI
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#6b6b75",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {shortenAddress(address)}
                  </span>
                </div>

                <div className="relative flex flex-col gap-1">
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      color: "#6b6b75",
                    }}
                  >
                    Earning across DeFi
                  </span>
                  <span
                    style={{
                      fontSize: 32,
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.1,
                    }}
                  >
                    {formatUsd(totalPositionsUsd)}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#6b6b75",
                    }}
                  >
                    in {positions.length} active vault
                    {positions.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="relative flex flex-col gap-2">
                  {positions.slice(0, 5).map((position, index) => {
                    const resolved = resolveProtocol(position.protocolName);
                    const chain = chainsById[position.chainId];
                    const usd = Number.parseFloat(position.balanceUsd ?? "0");
                    return (
                      <div
                        key={`${position.chainId}-${position.asset.address}-${index}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          backgroundColor: "rgba(27,27,31,0.8)",
                          borderRadius: 16,
                          padding: "12px 14px",
                          border: "1px solid #2c2c31",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              position: "relative",
                              width: 36,
                              height: 36,
                              flexShrink: 0,
                            }}
                          >
                            {resolved.logoPath ? (
                              <img
                                src={resolved.logoPath}
                                alt={resolved.displayName}
                                width={36}
                                height={36}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  objectFit: "contain",
                                  backgroundColor: "rgba(30,64,175,0.18)",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  backgroundColor: "rgba(30,64,175,0.18)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#60a5fa",
                                  fontSize: 14,
                                  fontWeight: 600,
                                }}
                              >
                                {resolved.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            {chain?.logoURI ? (
                              <img
                                src={chain.logoURI}
                                alt={chain.name}
                                width={14}
                                height={14}
                                style={{
                                  position: "absolute",
                                  bottom: -2,
                                  right: -2,
                                  width: 14,
                                  height: 14,
                                  borderRadius: "50%",
                                  border: "2px solid #131316",
                                  backgroundColor: "#131316",
                                  objectFit: "contain",
                                }}
                              />
                            ) : null}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              minWidth: 0,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#fff",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {resolved.displayName}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 500,
                                color: "#6b6b75",
                              }}
                            >
                              {position.asset.symbol} ·{" "}
                              {chain?.name ?? `Chain ${position.chainId}`}
                            </span>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {formatUsd(usd)}
                        </span>
                      </div>
                    );
                  })}
                  {positions.length > 5 ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#6b6b75",
                        textAlign: "center",
                        padding: 4,
                      }}
                    >
                      +{positions.length - 5} more vault
                      {positions.length - 5 === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>

                <div
                  className="relative"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 8,
                    borderTop: "1px solid #2c2c31",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#6b6b75",
                      }}
                    >
                      Earn with zMAAI
                    </span>
                    <img
                      src="/Assets/Images/Logo-Brand/logo.png"
                      alt="zMAAI"
                      width={14}
                      height={14}
                      style={{ width: 14, height: 14, objectFit: "contain" }}
                    />
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#6b6b75",
                      }}
                    >
                      Powered by Nox Protocol
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleShareX}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-black cursor-pointer transition-opacity active:scale-[0.98] hover:opacity-90"
              >
                <FaXTwitter className="h-4 w-4" />
                Flex your Position
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-surface-raised px-5 py-3 text-sm font-semibold text-main cursor-pointer transition-colors hover:bg-surface-muted active:scale-[0.98] disabled:opacity-60"
                >
                  <FiDownload className="h-4 w-4" />
                  {exporting ? "Saving…" : "Save image"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-main px-5 py-3 text-sm font-semibold text-muted cursor-pointer transition-colors hover:text-main hover:border-strong"
                >
                  <FiX className="h-4 w-4" />
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
