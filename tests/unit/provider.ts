import { decodeFunctionData, encodeFunctionResult, type Abi, type Address, type Hex } from 'viem';
import artifactJson from '../../build/contracts/CoinPledge.json';
import type { ContractArtifact, Provider } from '../../src/lib/contract';
export const user: Address = '0x1111111111111111111111111111111111111111';
export const other: Address = '0x2222222222222222222222222222222222222222';
export const address: Address = '0x3333333333333333333333333333333333333333';
export const artifact: ContractArtifact = { ...artifactJson, networks: { '31337': { address } } };
export const abi = artifact.abi as Abi;
export class FakeProvider implements Provider {
  selected: Address = user;
  chain = '0x7a69';
  network = '31337';
  connected = true;
  code = artifact.deployedBytecode;
  status = '0x1';
  sent: unknown[] = [];
  logs: unknown[] = [];
  estimateHook?: () => void;
  requestHook?: (method: string) => Promise<void>;
  listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  on(event: string, listener: (...args: unknown[]) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener);
  }
  removeListener(event: string, listener: (...args: unknown[]) => void) { this.listeners.get(event)?.delete(listener); }
  emit(event: string) { for (const listener of this.listeners.get(event) || []) listener(); }
  async request({ method, params = [] }: { method: string; params?: unknown[] }): Promise<unknown> {
    await this.requestHook?.(method);
    switch (method) {
      case 'net_version': return this.network;
      case 'eth_chainId': return this.chain;
      case 'eth_accounts': return this.connected ? [this.selected] : [];
      case 'eth_requestAccounts': this.connected = true; return [this.selected];
      case 'eth_getCode': return this.code;
      case 'eth_getLogs': return this.logs;
      case 'eth_getBlockByNumber': return { number: '0x1', timestamp: '0x100' };
      case 'eth_estimateGas': this.estimateHook?.(); return '0x100000';
      case 'eth_sendTransaction': this.sent.push(params[0]); return '0x' + 'ab'.repeat(32);
      case 'eth_getTransactionReceipt': return { status: this.status, transactionHash: params[0], blockNumber: '0x2' };
      case 'eth_call': {
        const { functionName } = decodeFunctionData({ abi, data: (params[0] as { data: Hex }).data });
        const results: Record<string, unknown> = { getUsersCount: 0n, users: [this.selected, ''], getBonusFund: 0n, withdrawableBalance: 0n, getChallengesForUser: [], getChallengesForMentor: [], isGameOver: false };
        if (!(functionName in results)) throw new Error(`Unexpected read ${functionName}`);
        return encodeFunctionResult({ abi, functionName, result: results[functionName] });
      }
      default: throw new Error(`Unexpected RPC ${method}`);
    }
  }
}
