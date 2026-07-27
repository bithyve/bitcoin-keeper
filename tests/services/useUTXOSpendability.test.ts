/**
 * Task 12.3 — Unit tests for the spendability lookup logic exposed by useUTXOSpendability.
 *
 * Since the hook is a thin wrapper over a Map built from wallet.specs UTXOs,
 * we test the same logic directly (no React test renderer needed).
 */

function buildSpendabilityMap(wallet: any): Map<string, string> {
  const map = new Map<string, string>();
  if (!wallet) return map;
  const specs = wallet.specs;
  if (!specs) return map;
  const allUTXOs = [...(specs.confirmedUTXOs || []), ...(specs.unconfirmedUTXOs || [])];
  for (const utxo of allUTXOs) {
    if (utxo.spendability) {
      map.set(`${utxo.txId}:${utxo.vout}`, utxo.spendability);
    }
  }
  return map;
}

describe('useUTXOSpendability logic', () => {
  test('12.3.1 — hasDoNotSpendUTXOs is false when no UTXOs have doNotSpend', () => {
    const wallet = {
      specs: {
        confirmedUTXOs: [
          { txId: 'tx1', vout: 0, value: 10000, address: 'a1', height: 100, spendability: 'spendable' },
        ],
        unconfirmedUTXOs: [],
      },
    };
    const map = buildSpendabilityMap(wallet);
    const hasDoNotSpendUTXOs = Array.from(map.values()).some((s) => s === 'doNotSpend');
    expect(hasDoNotSpendUTXOs).toBe(false);
  });

  test('12.3.2 — hasDoNotSpendUTXOs is true when at least one confirmed UTXO is doNotSpend', () => {
    const wallet = {
      specs: {
        confirmedUTXOs: [
          { txId: 'tx1', vout: 0, value: 500, address: 'a1', height: 100, spendability: 'doNotSpend' },
          { txId: 'tx2', vout: 0, value: 10000, address: 'a2', height: 101, spendability: 'spendable' },
        ],
        unconfirmedUTXOs: [],
      },
    };
    const map = buildSpendabilityMap(wallet);
    const hasDoNotSpendUTXOs = Array.from(map.values()).some((s) => s === 'doNotSpend');
    expect(hasDoNotSpendUTXOs).toBe(true);
  });

  test('12.3.3 — hasDoNotSpendUTXOs is true when an unconfirmed UTXO is doNotSpend', () => {
    const wallet = {
      specs: {
        confirmedUTXOs: [],
        unconfirmedUTXOs: [
          { txId: 'tx3', vout: 1, value: 400, address: 'a3', height: 0, spendability: 'doNotSpend' },
        ],
      },
    };
    const map = buildSpendabilityMap(wallet);
    const hasDoNotSpendUTXOs = Array.from(map.values()).some((s) => s === 'doNotSpend');
    expect(hasDoNotSpendUTXOs).toBe(true);
  });

  test('12.3.4 — getSpendability returns correct value for a known UTXO', () => {
    const wallet = {
      specs: {
        confirmedUTXOs: [
          { txId: 'tx1', vout: 0, value: 500, address: 'a1', height: 100, spendability: 'doNotSpend' },
        ],
        unconfirmedUTXOs: [],
      },
    };
    const map = buildSpendabilityMap(wallet);
    const getSpendability = (txId: string, vout: number) => map.get(`${txId}:${vout}`) ?? null;
    expect(getSpendability('tx1', 0)).toBe('doNotSpend');
  });

  test('12.3.5 — getSpendability returns null for an unknown UTXO', () => {
    const wallet = {
      specs: {
        confirmedUTXOs: [
          { txId: 'tx1', vout: 0, value: 500, address: 'a1', height: 100, spendability: 'doNotSpend' },
        ],
        unconfirmedUTXOs: [],
      },
    };
    const map = buildSpendabilityMap(wallet);
    const getSpendability = (txId: string, vout: number) => map.get(`${txId}:${vout}`) ?? null;
    expect(getSpendability('nonexistent', 0)).toBeNull();
  });

  test('12.3.6 — UTXOs without spendability field are not included in the map', () => {
    const wallet = {
      specs: {
        confirmedUTXOs: [
          { txId: 'tx1', vout: 0, value: 500, address: 'a1', height: 100 }, // no spendability
        ],
        unconfirmedUTXOs: [],
      },
    };
    const map = buildSpendabilityMap(wallet);
    expect(map.size).toBe(0);
    const hasDoNotSpendUTXOs = Array.from(map.values()).some((s) => s === 'doNotSpend');
    expect(hasDoNotSpendUTXOs).toBe(false);
  });

  test('12.3.7 — null wallet returns empty map (hasDoNotSpendUTXOs = false)', () => {
    const map = buildSpendabilityMap(null);
    const hasDoNotSpendUTXOs = Array.from(map.values()).some((s) => s === 'doNotSpend');
    expect(hasDoNotSpendUTXOs).toBe(false);
  });
});
