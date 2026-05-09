# iExec Vibe Coding Challenge - zMAAI

**zMAAI** = Confidential Yield Vault Aggregator. BUILT & DEPLOYED.

## Apa Aplikasi Ini?

Yield farming lacks privacy. Every position, balance, and strategy is visible on-chain — exposed to MEV bots and copy-traders.

zMAAI menyelesaikan ini dengan:
1. User deposit USDC/RLC → di-wrap ke cUSDC/cRLC (ERC-7984 confidential token)
2. cUSDC/cRLC masuk ke ERC-4626 yield vault
3. Balance tersembunyi dari public chain

Think: **yield aggregator meets confidential computing — Arbitrum-first.**

## Deployed Contracts (Arbitrum Sepolia 421614)

### Confidential Tokens (ERC-7984)

| Token | Address | Standard |
|-------|---------|----------|
| USDC | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` | ERC-20 |
| **cUSDC** | `0x1ccec6bc60db15e4055d43dc2531bb7d4e5b808e` | ERC-7984 |
| RLC | `0x9923eD3cbd90CD78b910c475f9A731A6e0b8C963` | ERC-20 |
| **cRLC** | `0x92b23f4a59175415ced5cb37e64a1fc6a9d79af4` | ERC-7984 |

### Yield Vaults (ERC-4626)

| Vault | Asset | Address |
|-------|-------|---------|
| Nox cUSDC Vault | cUSDC | `0x75ef70Ea33994a16751ff0b4f7DCF0F94DF1351F` |
| Nox cRLC Vault | cRLC | `0x1955eF9145cCAa643a8Ee61aE3206F0acb632Adf` |

## Flows

### Deposit (3 steps)
```
USDC → Approve cUSDC → Wrap to cUSDC → Approve Vault → Deposit to Vault
```

### Withdraw (2 steps)
```
Redeem shares from Vault → Unwrap cUSDC → USDC
```

### Portfolio (on-chain read)
```
vault.balanceOf(user) → calculate share value → display
```

## Setup & Run

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Buka http://localhost:3000/earn

## Architecture

- **Nox Protocol** — confidential vault (API: `src/app/api/nox/*`)
- **LI.FI** — general earn fallback (API: `src/app/api/earn/*`)
- **ERC-4626 Vault** — `contracts/NoxYieldVault.sol` (ABI: `src/lib/nox-vault-contract.ts`)
- Handle client: `@/lib/nox-handle.ts`

## Key Files

| Path | Purpose |
|------|---------|
| `contracts/NoxYieldVault.sol` | ERC-4626 vault contract |
| `src/lib/nox-vault-contract.ts` | Vault ABI |
| `src/lib/nox-types.ts` | Contract addresses & types |
| `src/stores/nox-deposit-store.ts` | Deposit flow (approve→wrap→deposit) |
| `src/stores/nox-withdraw-store.ts` | Withdraw flow (redeem→unwrap) |
| `src/app/api/nox/vaults/route.ts` | Real on-chain TVL/APY |
| `src/app/api/nox/portfolio/[address]/route.ts` | Real on-chain balances |

## Submission Checklist

- [x] Deployed on Arbitrum Sepolia
- [x] End-to-end functionality (no mock data in code)
- [x] cUSDC, cRLC confidential tokens (ERC-7984)
- [x] ERC-4626 yield vault contract
- [x] Deploy vault contracts → `NOX_VAULTS` addresses updated
- [ ] **X Post** — demo video + repo link + tag @iExecDev @Chain_GPT
- [ ] **feedback.md** — iExec tools feedback
