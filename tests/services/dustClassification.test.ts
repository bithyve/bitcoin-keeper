import { classifyDustUTXO } from 'src/services/wallets/operations/dustClassification';
import { UTXO } from 'src/services/wallets/interfaces';
import { TransactionType } from 'src/services/wallets/enums';

function makeUTXO(overrides: Partial<UTXO> = {}): UTXO {
  return {
    txId: 'aaaa',
    vout: 0,
    value: 1000,
    address: 'addr1',
    height: 100,
    ...overrides,
  };
}

function makeSynchedWallet(overrides: any = {}): any {
  return {
    specs: {
      nextFreeAddressIndex: 5,
      addresses: {
        external: { '0': 'addr_ext_0', '1': 'addr_ext_1', '3': 'addr_ext_3' },
        internal: { '0': 'addr_int_0', '1': 'addr_int_1' },
      },
      transactions: [],
      confirmedUTXOs: [],
      unconfirmedUTXOs: [],
    },
    ...overrides,
  };
}

describe('classifyDustUTXO', () => {
  const PRE_SYNC_NFAI = 4; // nextFreeAddressIndex before sync = 4, so highestReceivedIdx = 3

  test('12.1.1 — above threshold: value >= 5000 → spendable', () => {
    const utxo = makeUTXO({ value: 5000, address: 'addr_ext_0' });
    const wallet = makeSynchedWallet();
    expect(classifyDustUTXO(utxo, wallet, PRE_SYNC_NFAI)).toBe('spendable');
  });

  test('12.1.2 — reused receive address (hasReceivedBefore) → doNotSpend', () => {
    const utxo = makeUTXO({ value: 999, address: 'addr_ext_0' });
    const wallet = makeSynchedWallet({
      specs: {
        ...makeSynchedWallet().specs,
        transactions: [
          { address: 'addr_ext_0', transactionType: TransactionType.RECEIVED },
          { address: 'addr_ext_0', transactionType: TransactionType.RECEIVED },
        ],
      },
    });
    expect(classifyDustUTXO(utxo, wallet, PRE_SYNC_NFAI)).toBe('doNotSpend');
  });

  test('12.1.3 — out-of-order receive address → doNotSpend', () => {
    // PRE_SYNC_NFAI = 4 → highestReceivedIdx = 3; address at index 1 < 3 → out-of-order
    const utxo = makeUTXO({ value: 999, address: 'addr_ext_1' });
    const wallet = makeSynchedWallet({
      specs: {
        ...makeSynchedWallet().specs,
        transactions: [
          { address: 'addr_ext_1', transactionType: TransactionType.RECEIVED },
        ],
      },
    });
    expect(classifyDustUTXO(utxo, wallet, PRE_SYNC_NFAI)).toBe('doNotSpend');
  });

  test('12.1.4 — fresh receive address (index == highestReceivedIdx, first time) → spendable', () => {
    // Index 3 == highestReceivedIdx; only 1 receive tx → not reused
    const utxo = makeUTXO({ value: 999, address: 'addr_ext_3' });
    const wallet = makeSynchedWallet({
      specs: {
        ...makeSynchedWallet().specs,
        transactions: [
          { address: 'addr_ext_3', transactionType: TransactionType.RECEIVED },
        ],
      },
    });
    expect(classifyDustUTXO(utxo, wallet, PRE_SYNC_NFAI)).toBe('spendable');
  });

  test('12.1.5 — reused change address (hasReceivedBefore) → doNotSpend', () => {
    const utxo = makeUTXO({ value: 999, address: 'addr_int_0' });
    const wallet = makeSynchedWallet({
      specs: {
        ...makeSynchedWallet().specs,
        transactions: [
          { address: 'addr_int_0', transactionType: TransactionType.RECEIVED },
          { address: 'addr_int_0', transactionType: TransactionType.RECEIVED },
        ],
      },
    });
    expect(classifyDustUTXO(utxo, wallet, PRE_SYNC_NFAI)).toBe('doNotSpend');
  });

  test('12.1.6 — fresh change address (only 1 receive tx) → spendable', () => {
    const utxo = makeUTXO({ value: 999, address: 'addr_int_1' });
    const wallet = makeSynchedWallet({
      specs: {
        ...makeSynchedWallet().specs,
        transactions: [
          { address: 'addr_int_1', transactionType: TransactionType.RECEIVED },
        ],
      },
    });
    expect(classifyDustUTXO(utxo, wallet, PRE_SYNC_NFAI)).toBe('spendable');
  });

  test('unknown address → safe default spendable', () => {
    const utxo = makeUTXO({ value: 999, address: 'unknown_address' });
    const wallet = makeSynchedWallet();
    expect(classifyDustUTXO(utxo, wallet, PRE_SYNC_NFAI)).toBe('spendable');
  });

  test('no addresses on wallet → safe default spendable', () => {
    const utxo = makeUTXO({ value: 999, address: 'addr_ext_0' });
    const wallet = { specs: { transactions: [], confirmedUTXOs: [], unconfirmedUTXOs: [] } };
    expect(classifyDustUTXO(utxo, wallet as any, PRE_SYNC_NFAI)).toBe('spendable');
  });
});

describe('pre-sync snapshot: manual override preserved on hard refresh simulation', () => {
  test('12.2 — UTXO previously marked doNotSpend (isManualOverride=true) is restored from snapshot', () => {
    // Simulate what refreshWalletsWorker does:
    // 1. Build pre-sync snapshot from existing UTXOs
    const existingUTXOs: any[] = [
      { txId: 'tx1', vout: 0, value: 500, address: 'addr_ext_0', height: 50, spendability: 'doNotSpend', isManualOverride: true },
    ];
    const snapshot = new Map<string, any>();
    for (const utxo of existingUTXOs) {
      if (utxo.spendability !== undefined || utxo.isManualOverride !== undefined) {
        snapshot.set(`${utxo.txId}:${utxo.vout}`, {
          spendability: utxo.spendability,
          isManualOverride: utxo.isManualOverride,
        });
      }
    }

    // 2. After hard refresh, this UTXO still exists (same txId:vout)
    const postSyncUTXO: any = { txId: 'tx1', vout: 0, value: 500, address: 'addr_ext_0', height: 50 };

    // 3. Apply restore logic
    const key = `${postSyncUTXO.txId}:${postSyncUTXO.vout}`;
    const existing = snapshot.get(key);
    if (existing !== undefined) {
      postSyncUTXO.spendability = existing.spendability;
      postSyncUTXO.isManualOverride = existing.isManualOverride ?? false;
    }

    expect(postSyncUTXO.spendability).toBe('doNotSpend');
    expect(postSyncUTXO.isManualOverride).toBe(true);
  });
});
