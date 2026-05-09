# iExec Nox Protocol & Confidential Token - Feedback

## Project: zMAAI - Confidential Yield Vault Aggregator

### Overall Experience

Building with Nox Protocol was smooth once we understood the architecture. The concept of confidential tokens (ERC-7984) wrapping regular ERC-20s is elegant and fits naturally into our yield aggregator use case. The `@iexec-nox/handle` SDK works seamlessly with viem/wagmi, making integration straightforward.

### What Worked Well

- **JS SDK (`@iexec-nox/handle`)**: Easy to integrate with viem. The `encryptInput` and `decrypt` functions are intuitive. Creating a HandleClient with `createViemHandleClient` worked out of the box. Built-in Arbitrum Sepolia config (chainId 421614) is a nice touch.
- **ERC-7984 Standard**: The confidential token standard is well-designed. Wrapping ERC-20 → cToken is a clean abstraction that preserves DeFi composability. The `wrap` function accepting cleartext amounts is simpler than expected.
- **Deployed Contracts on Arbitrum Sepolia**: Real cUSDC and cRLC contracts are live at known addresses. Source code at https://github.com/iExec-Nox/demo-ctoken made it easy to find the correct ABIs.
- **ChainGPT Integration**: The AI assistant added value for smart contract auditing and vault strategy recommendations.
- **Documentation**: docs.iex.ec had the key concepts clearly explained. The Hello World guide was especially helpful for understanding the handle/ACL pattern.

### Challenges & Suggestions

1. **Limited Deployed Tokens**: Only cUSDC and cRLC are deployed on Arbitrum Sepolia. No cUSDT, cWETH, or cWBTC yet. Adding a faucet with more tokens would help developers build more diverse use cases.
2. **Package Discovery**: It took some digging to find all packages under `@iexec-nox/`. A clearer package registry or summary page on npm would help. The demo-ctoken repo was our best reference for contract addresses.
3. **wrap() ABI Clarification**: The `wrap` function takes a cleartext amount (not an encrypted handle) and returns a handle. This was non-obvious — clarifying this in the SDK docs would save time.
4. **Error Messages**: Some SDK errors were generic. More descriptive error messages (e.g., "handle expired", "ACL denied", "chain not supported") would improve debugging.
5. **TypeScript Types**: The `SolidityType` union could be better documented with available values. Only `uint256`, `bool`, and `address` are implemented.
6. **Real Vault Registry**: For the hackathon, we needed to construct vault data from known contracts. A live vault registry API or subgraph would be valuable.
7. **Gas Costs**: TEE computation adds gas overhead. Documentation on expected gas costs for common operations would help with UX planning.

### What We Built

- Confidential yield vault aggregator on Arbitrum Sepolia
- Real integration with cUSDC (0x1ccec6bc60db15e4055d43dc2531bb7d4e5b808e) and cRLC (0x92b23f4a59175415ced5cb37e64a1fc6a9d79af4)
- Privacy-protected deposits via ERC-7984 (balances hidden, MEV protected)
- Wrap + approve flow using viem/wagmi + `@iexec-nox/handle`
- ChainGPT-powered vault recommendations
- Deployed live at https://iex-ai.vercel.app

### Rating

- Ease of integration: 8/10
- Documentation quality: 7/10
- SDK developer experience: 8/10
- Available deployed contracts: 6/10 (only 2 tokens)
- Overall satisfaction: 8/10

### Would Use Again?

Yes. The Nox Protocol provides a unique value proposition for DeFi privacy. The ERC-7984 standard is well thought out and the SDK is developer-friendly. We look forward to more confidential vaults and tokens being deployed on mainnet.