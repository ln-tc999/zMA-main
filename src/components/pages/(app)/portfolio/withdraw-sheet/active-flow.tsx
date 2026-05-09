"use client";

export function ConnectionGate() {
  const { useAccount } = require("wagmi");
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    const { ConnectPrompt } = require("./withdraw-sheet-states");
    return <ConnectPrompt />;
  }

  return <div className="text-sm text-muted">Using LI.FI withdraw flow</div>;
}

export function WithdrawActiveFlow() {
  return (
    <div className="text-sm text-muted">
      LI.FI withdraw flow - connect wallet to continue
    </div>
  );
}
