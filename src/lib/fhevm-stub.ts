export interface FhevmInstance {
  getPublicKey(): Promise<string>;
  encrypt64: (val: bigint) => Promise<`0x${string}`>;
  encrypt128: (val: bigint) => Promise<`0x${string}`>;
  decrypt64: (encrypted: `0x${string}`) => Promise<string>;
  decrypt128: (encrypted: `0x${string}`) => Promise<string>;
}

export async function createInstanceStub() {
  return {
    initialize: async () => {},
    getPublicKey: async () => "0x",
  } as unknown as FhevmInstance;
}
