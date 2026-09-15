import type { Address, Hex } from 'viem';
import { accounts, createContractClient, type ContractArtifact, type ContractClient, type Provider } from './contract';
import { errorMessage, type Dashboard } from './model';

export interface WalletState {
  account?: Address;
  client?: ContractClient;
  data?: Dashboard;
  connecting: boolean;
  busy: string;
  hash?: Hex;
  error: string;
  notice: string;
}
export const emptyWallet = (): WalletState => ({ connecting: false, busy: '', error: '', notice: '' });

export class WalletSession {
  private generation = 0;
  private state: WalletState = emptyWallet();
  private subscribers = new Set<(state: WalletState) => void>();
  private refreshing = false;
  private timer?: ReturnType<typeof setInterval>;

  constructor(private provider: Provider, private artifact: ContractArtifact) {}

  subscribe(listener: (state: WalletState) => void) {
    this.subscribers.add(listener);
    listener(this.state);
    return () => { this.subscribers.delete(listener); };
  }

  private update(values: Partial<WalletState>) {
    this.state = { ...this.state, ...values };
    for (const listener of this.subscribers) listener(this.state);
  }

  private changed = () => { void this.connect(false); };

  start() {
    this.provider.on?.('accountsChanged', this.changed);
    this.provider.on?.('chainChanged', this.changed);
    this.provider.on?.('disconnect', this.disconnected);
    this.timer = setInterval(() => { void this.refresh(); }, 5000);
    void this.connect(false);
    return () => {
      this.generation++;
      clearInterval(this.timer);
      this.provider.removeListener?.('accountsChanged', this.changed);
      this.provider.removeListener?.('chainChanged', this.changed);
      this.provider.removeListener?.('disconnect', this.disconnected);
    };
  }

  private disconnected = () => {
    this.generation++;
    this.update({ ...emptyWallet(), account: undefined, client: undefined, data: undefined, hash: undefined });
  };

  async connect(requestPermission = true) {
    const generation = ++this.generation;
    this.update({ ...emptyWallet(), connecting: true, account: undefined, client: undefined, data: undefined, hash: undefined });
    try {
      const [account] = await accounts(this.provider, requestPermission);
      if (generation !== this.generation) return;
      if (!account) { this.update({ connecting: false }); return; }
      const client = await createContractClient(this.provider, this.artifact);
      const data = await client.dashboard(account);
      if (generation === this.generation) this.update({ account, client, data, connecting: false });
    } catch (error) {
      if (generation === this.generation) this.update({ connecting: false, error: errorMessage(error) });
    }
  }

  async refresh() {
    const { account, client } = this.state;
    if (!account || !client || this.refreshing) return;
    const generation = this.generation;
    this.refreshing = true;
    try {
      const data = await client.dashboard(account);
      if (generation === this.generation) this.update({ data });
    } catch (error) {
      if (generation === this.generation) this.update({ error: errorMessage(error) });
    } finally { this.refreshing = false; }
  }

  async transact(label: string, send: (client: ContractClient, account: Address) => Promise<Hex>): Promise<boolean> {
    const { client, account, busy } = this.state;
    if (!client || !account || busy) return false;
    const generation = this.generation;
    this.update({ busy: label, error: '', notice: '', hash: undefined });
    try {
      const hash = await send(client, account);
      if (generation !== this.generation) return false;
      this.update({ hash });
      await client.waitForReceipt(hash);
      if (generation !== this.generation) return false;
      this.update({ busy: '', notice: `${label} confirmed.` });
      await this.refresh();
      return true;
    } catch (error) {
      if (generation === this.generation) this.update({ busy: '', error: errorMessage(error) });
      return false;
    }
  }
}
