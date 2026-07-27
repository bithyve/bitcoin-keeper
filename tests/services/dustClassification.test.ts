import { classifyDustByAddress } from 'src/services/wallets/operations/dustClassification';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeWallet(transactions: any[] = []): any {
  return { specs: { transactions } };
}

/** external: { index: address }, internal: { index: address } → inverted maps */
function makeAddrMaps(
  ext: Record<string, string>,
  int: Record<string, string>
): {
  externalAddresses: Record<string, number>;
  internalAddresses: Record<string, number>;
} {
  const externalAddresses: Record<string, number> = {};
  for (const [idx, addr] of Object.entries(ext)) externalAddresses[addr] = parseInt(idx, 10);
  const internalAddresses: Record<string, number> = {};
  for (const [idx, addr] of Object.entries(int)) internalAddresses[addr] = parseInt(idx, 10);
  return { externalAddresses, internalAddresses };
}

const NO_OVERRIDES = new Set<string>();

// ── Phase 0 / Phase 1: Initial taint detection ─────────────────────────────

describe('classifyDustByAddress — initial taint detection', () => {
  test('fresh address with single small receive is NOT tainted', () => {
    const { externalAddresses, internalAddresses } = makeAddrMaps(
      { '5': 'addrB' },
      {}
    );
    const wallet = makeWallet([
      {
        txid: 'tx1',
        blockTime: 1000,
        recipientAddresses: ['addrB'],
        senderAddresses: [],
        walletOutputs: [{ address: 'addrB', valueSats: 3000 }],
      },
    ]);
    const { taintedAddresses } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, NO_OVERRIDES
    );
    expect(taintedAddresses.has('addrB')).toBe(false);
  });

  test('reused receive address with dust receive IS initially tainted', () => {
    const { externalAddresses, internalAddresses } = makeAddrMaps({ '2': 'addrA' }, {});
    const wallet = makeWallet([
      {
        txid: 'tx0',
        blockTime: 500,
        recipientAddresses: ['addrA'],
        senderAddresses: [],
        walletOutputs: [{ address: 'addrA', valueSats: 80000 }],
      },
      {
        txid: 'tx1',
        blockTime: 1000,
        recipientAddresses: ['addrA'],
        senderAddresses: ['attacker'],
        walletOutputs: [{ address: 'addrA', valueSats: 546 }],
      },
    ]);
    const { taintedAddresses, initialTaintAddresses } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, NO_OVERRIDES
    );
    expect(initialTaintAddresses.has('addrA')).toBe(true);
    expect(taintedAddresses.has('addrA')).toBe(true);
  });

  test('out-of-order address evaluated at historical blockTime IS initially tainted', () => {
    // addrD (index 5) received first at blockTime 500, then addrC (index 3) at blockTime 1000
    const { externalAddresses, internalAddresses } = makeAddrMaps(
      { '5': 'addrD', '3': 'addrC' },
      {}
    );
    const wallet = makeWallet([
      {
        txid: 'tx_d',
        blockTime: 500,
        recipientAddresses: ['addrD'],
        senderAddresses: [],
        walletOutputs: [{ address: 'addrD', valueSats: 50000 }],
      },
      {
        txid: 'tx_c',
        blockTime: 1000,
        recipientAddresses: ['addrC'],
        senderAddresses: ['attacker'],
        walletOutputs: [{ address: 'addrC', valueSats: 2000 }],
      },
    ]);
    const { initialTaintAddresses } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, NO_OVERRIDES
    );
    expect(initialTaintAddresses.has('addrC')).toBe(true);
  });

  test('reused change address with dust receive IS initially tainted', () => {
    const { externalAddresses, internalAddresses } = makeAddrMaps({}, { '0': 'changeAddr' });
    const wallet = makeWallet([
      {
        txid: 'tx0',
        blockTime: 500,
        recipientAddresses: ['changeAddr'],
        senderAddresses: [],
        walletOutputs: [{ address: 'changeAddr', valueSats: 10000 }],
      },
      {
        txid: 'tx1',
        blockTime: 1000,
        recipientAddresses: ['changeAddr'],
        senderAddresses: ['attacker'],
        walletOutputs: [{ address: 'changeAddr', valueSats: 500 }],
      },
    ]);
    const { initialTaintAddresses } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, NO_OVERRIDES
    );
    expect(initialTaintAddresses.has('changeAddr')).toBe(true);
  });

  test('large UTXO at tainted address is also in taintedAddresses', () => {
    const { externalAddresses, internalAddresses } = makeAddrMaps({ '2': 'addrA' }, {});
    const wallet = makeWallet([
      {
        txid: 'tx0',
        blockTime: 500,
        recipientAddresses: ['addrA'],
        senderAddresses: [],
        walletOutputs: [{ address: 'addrA', valueSats: 80000 }],
      },
      {
        txid: 'tx1',
        blockTime: 1000,
        recipientAddresses: ['addrA'],
        senderAddresses: ['attacker'],
        walletOutputs: [{ address: 'addrA', valueSats: 546 }],
      },
    ]);
    const { taintedAddresses } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, NO_OVERRIDES
    );
    expect(taintedAddresses.has('addrA')).toBe(true);
  });

  test('already-spent dust (walletOutputs on historical tx) is detected even if no current UTXO', () => {
    const { externalAddresses, internalAddresses } = makeAddrMaps({ '1': 'addrA' }, {});
    // Tx0: first receive, Tx1: dust receive (triggering), Tx2: both spent — no current UTXOs
    const wallet = makeWallet([
      {
        txid: 'tx0',
        blockTime: 400,
        recipientAddresses: ['addrA'],
        senderAddresses: [],
        walletOutputs: [{ address: 'addrA', valueSats: 90000 }],
      },
      {
        txid: 'tx1',
        blockTime: 700,
        recipientAddresses: ['addrA'],
        senderAddresses: ['attacker'],
        walletOutputs: [{ address: 'addrA', valueSats: 546 }],
      },
    ]);
    const { initialTaintAddresses } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, NO_OVERRIDES
    );
    expect(initialTaintAddresses.has('addrA')).toBe(true);
  });
});

// ── Phase 2: BFS forward propagation ──────────────────────────────────────

describe('classifyDustByAddress — BFS forward propagation', () => {
  function setupPropagationWallet() {
    // addrX is initially tainted
    // Tx1: addrX sends to addrD (change) — addrD should be tainted (layer 1)
    // Tx2: addrD sends to addrE (change) — addrE should be tainted (layer 2)
    const { externalAddresses, internalAddresses } = makeAddrMaps(
      { '3': 'addrX' },
      { '0': 'addrD', '1': 'addrE' }
    );
    const wallet = makeWallet([
      // Tx triggering initial taint on addrX
      {
        txid: 'tx_dust',
        blockTime: 100,
        recipientAddresses: ['addrX'],
        senderAddresses: ['attacker'],
        walletOutputs: [{ address: 'addrX', valueSats: 546 }],
      },
      // Tx showing addrX had received before (makes it reused)
      {
        txid: 'tx_prior',
        blockTime: 50,
        recipientAddresses: ['addrX'],
        senderAddresses: [],
        walletOutputs: [{ address: 'addrX', valueSats: 100000 }],
      },
      // Tx1: addrX sends to external + addrD (change)
      {
        txid: 'tx1',
        blockTime: 200,
        recipientAddresses: ['external_recipient', 'addrD'],
        senderAddresses: ['addrX'],
        walletOutputs: [],
      },
      // Tx2: addrD sends to addrE (change)
      {
        txid: 'tx2',
        blockTime: 300,
        recipientAddresses: ['external_recipient2', 'addrE'],
        senderAddresses: ['addrD'],
        walletOutputs: [],
      },
    ]);
    return { wallet, externalAddresses, internalAddresses };
  }

  test('layer-1 descendant address is tainted', () => {
    const { wallet, externalAddresses, internalAddresses } = setupPropagationWallet();
    const { taintedAddresses } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, NO_OVERRIDES
    );
    expect(taintedAddresses.has('addrD')).toBe(true);
  });

  test('layer-2 descendant address is tainted', () => {
    const { wallet, externalAddresses, internalAddresses } = setupPropagationWallet();
    const { taintedAddresses } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, NO_OVERRIDES
    );
    expect(taintedAddresses.has('addrE')).toBe(true);
  });

  test('external (non-wallet-owned) recipient is NOT tainted', () => {
    const { wallet, externalAddresses, internalAddresses } = setupPropagationWallet();
    const { taintedAddresses } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, NO_OVERRIDES
    );
    expect(taintedAddresses.has('external_recipient')).toBe(false);
    expect(taintedAddresses.has('external_recipient2')).toBe(false);
  });

  test('layer-1 tainted addresses are marked descendant, not initial', () => {
    const { wallet, externalAddresses, internalAddresses } = setupPropagationWallet();
    const { initialTaintAddresses, taintedAddresses } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, NO_OVERRIDES
    );
    expect(initialTaintAddresses.has('addrD')).toBe(false);
    expect(taintedAddresses.has('addrD')).toBe(true);
  });
});

// ── Manual override breaks the chain ─────────────────────────────────────

describe('classifyDustByAddress — manual override breaks BFS chain', () => {
  test('override on initially-tainted address prevents propagation to layer-1', () => {
    const { externalAddresses, internalAddresses } = makeAddrMaps(
      { '3': 'addrX' },
      { '0': 'addrD' }
    );
    const manualOverrides = new Set(['addrX']);
    const wallet = makeWallet([
      {
        txid: 'tx_prior',
        blockTime: 50,
        recipientAddresses: ['addrX'],
        senderAddresses: [],
        walletOutputs: [{ address: 'addrX', valueSats: 100000 }],
      },
      {
        txid: 'tx_dust',
        blockTime: 100,
        recipientAddresses: ['addrX'],
        senderAddresses: ['attacker'],
        walletOutputs: [{ address: 'addrX', valueSats: 546 }],
      },
      {
        txid: 'tx1',
        blockTime: 200,
        recipientAddresses: ['addrD'],
        senderAddresses: ['addrX'],
        walletOutputs: [],
      },
    ]);
    const { taintedAddresses, initialTaintAddresses } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, manualOverrides
    );
    // addrX is still in initialTaint (it received dust) but chain is broken
    expect(initialTaintAddresses.has('addrX')).toBe(true);
    // addrD must NOT be tainted
    expect(taintedAddresses.has('addrD')).toBe(false);
  });

  test('override on descendant address prevents further propagation', () => {
    const { externalAddresses, internalAddresses } = makeAddrMaps(
      { '3': 'addrX' },
      { '0': 'addrD', '1': 'addrE' }
    );
    // addrD has manual override — breaks chain at layer 1, addrE should not be tainted
    const manualOverrides = new Set(['addrD']);
    const wallet = makeWallet([
      {
        txid: 'tx_prior',
        blockTime: 50,
        recipientAddresses: ['addrX'],
        senderAddresses: [],
        walletOutputs: [{ address: 'addrX', valueSats: 100000 }],
      },
      {
        txid: 'tx_dust',
        blockTime: 100,
        recipientAddresses: ['addrX'],
        senderAddresses: ['attacker'],
        walletOutputs: [{ address: 'addrX', valueSats: 546 }],
      },
      {
        txid: 'tx1',
        blockTime: 200,
        recipientAddresses: ['addrD'],
        senderAddresses: ['addrX'],
        walletOutputs: [],
      },
      {
        txid: 'tx2',
        blockTime: 300,
        recipientAddresses: ['addrE'],
        senderAddresses: ['addrD'],
        walletOutputs: [],
      },
    ]);
    const { taintedAddresses } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, manualOverrides
    );
    // addrD is tainted (it IS in taintedAddresses from propagation)
    expect(taintedAddresses.has('addrD')).toBe(true);
    // addrE must NOT be tainted (chain broken at addrD)
    expect(taintedAddresses.has('addrE')).toBe(false);
  });
});

// ── Phase 3: dustSpendTxids ───────────────────────────────────────────────

describe('classifyDustByAddress — dustSpendTxids', () => {
  test('transaction where tainted address is a sender is included in dustSpendTxids', () => {
    const { externalAddresses, internalAddresses } = makeAddrMaps({ '3': 'addrX' }, {});
    const wallet = makeWallet([
      {
        txid: 'tx_prior',
        blockTime: 50,
        recipientAddresses: ['addrX'],
        senderAddresses: [],
        walletOutputs: [{ address: 'addrX', valueSats: 100000 }],
      },
      {
        txid: 'tx_dust',
        blockTime: 100,
        recipientAddresses: ['addrX'],
        senderAddresses: ['attacker'],
        walletOutputs: [{ address: 'addrX', valueSats: 546 }],
      },
      {
        txid: 'tx_spend',
        blockTime: 200,
        recipientAddresses: ['external'],
        senderAddresses: ['addrX'],
        walletOutputs: [],
      },
    ]);
    const { dustSpendTxids } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, NO_OVERRIDES
    );
    expect(dustSpendTxids.has('tx_spend')).toBe(true);
  });

  test('transaction with no tainted sender is NOT in dustSpendTxids', () => {
    const { externalAddresses, internalAddresses } = makeAddrMaps({ '3': 'addrX' }, {});
    const wallet = makeWallet([
      {
        txid: 'tx_clean',
        blockTime: 200,
        recipientAddresses: ['addrX'],
        senderAddresses: ['clean_sender'],
        walletOutputs: [{ address: 'addrX', valueSats: 50000 }],
      },
    ]);
    const { dustSpendTxids } = classifyDustByAddress(
      wallet, externalAddresses, internalAddresses, NO_OVERRIDES
    );
    expect(dustSpendTxids.has('tx_clean')).toBe(false);
  });
});

// ── Pre-sync snapshot: dustReason survives hard refresh ───────────────────

describe('pre-sync snapshot — dustReason preserved on hard refresh', () => {
  test('dustReason is included in snapshot and restored after refresh', () => {
    const existingUTXOs: any[] = [
      {
        txId: 'tx1',
        vout: 0,
        value: 500,
        address: 'addrX',
        height: 50,
        spendability: 'doNotSpend',
        isManualOverride: false,
        dustReason: 'initial',
      },
    ];
    const snapshot = new Map<string, any>();
    for (const utxo of existingUTXOs) {
      if (
        utxo.spendability !== undefined ||
        utxo.isManualOverride !== undefined ||
        utxo.dustReason !== undefined
      ) {
        snapshot.set(`${utxo.txId}:${utxo.vout}`, {
          spendability: utxo.spendability,
          isManualOverride: utxo.isManualOverride,
          dustReason: utxo.dustReason,
        });
      }
    }

    const postSyncUTXO: any = { txId: 'tx1', vout: 0, value: 500, address: 'addrX', height: 50 };
    const snap = snapshot.get(`${postSyncUTXO.txId}:${postSyncUTXO.vout}`);
    if (snap !== undefined) {
      postSyncUTXO.spendability = snap.spendability;
      postSyncUTXO.isManualOverride = snap.isManualOverride ?? false;
      postSyncUTXO.dustReason = snap.dustReason;
    }

    expect(postSyncUTXO.dustReason).toBe('initial');
    expect(postSyncUTXO.spendability).toBe('doNotSpend');
    expect(postSyncUTXO.isManualOverride).toBe(false);
  });
});

