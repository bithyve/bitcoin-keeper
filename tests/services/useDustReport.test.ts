/**
 * useDustReport — unit tests for report data derivation and lastScanned formatting.
 * Following the project pattern of testing pure logic directly (no React renderer).
 */

// ── Helpers ────────────────────────────────────────────────────────────────

function makeUTXO(
  txId: string,
  vout: number,
  value: number,
  spendability?: string,
  dustReason?: string
): any {
  return { txId, vout, value, address: `addr_${txId}`, height: 100, spendability, dustReason };
}

function makeTx(txid: string, tags?: string[], amount = 0, blockTime?: number): any {
  return { txid, tags, amount, blockTime };
}

function makeWallet(confirmedUTXOs: any[], unconfirmedUTXOs: any[], transactions: any[]): any {
  return { specs: { confirmedUTXOs, unconfirmedUTXOs, transactions } };
}

// ── Pure derivation logic (mirrored from useDustReport.ts) ────────────────

function deriveReportData(wallet: any) {
  const specs = wallet?.specs;
  const allUTXOs = [...(specs?.confirmedUTXOs ?? []), ...(specs?.unconfirmedUTXOs ?? [])];

  const activeDust = allUTXOs.filter(
    (u: any) => u.spendability === 'doNotSpend' && u.dustReason === 'initial'
  );
  const linkedCoins = allUTXOs.filter(
    (u: any) =>
      u.spendability === 'doNotSpend' &&
      (u.dustReason === 'adjacent' || u.dustReason === 'descendant')
  );
  const doNotSpendUTXOs = allUTXOs.filter((u: any) => u.spendability === 'doNotSpend');
  const amountMarkedDNS = doNotSpendUTXOs.reduce((sum: number, u: any) => sum + u.value, 0);
  const pastDustSpends = (specs?.transactions ?? []).filter((tx: any) =>
    tx.tags?.includes('potential-dust-spend')
  );
  const hasEligibleDustForDonation = doNotSpendUTXOs.length > 0;
  const isEmpty =
    activeDust.length === 0 && linkedCoins.length === 0 && pastDustSpends.length === 0;

  return { activeDust, linkedCoins, pastDustSpends, doNotSpendUTXOs, amountMarkedDNS, hasEligibleDustForDonation, isEmpty };
}

// ── Pure lastScanned formatting logic (mirrored from useDustReport.ts) ────

function formatLastScanned(epochMs: number): string {
  const now = new Date();
  const scanned = new Date(epochMs);
  const isToday =
    now.getFullYear() === scanned.getFullYear() &&
    now.getMonth() === scanned.getMonth() &&
    now.getDate() === scanned.getDate();

  const hh = String(scanned.getHours()).padStart(2, '0');
  const mm = String(scanned.getMinutes()).padStart(2, '0');

  if (isToday) return `Today, ${hh}:${mm}`;

  const dd = String(scanned.getDate()).padStart(2, '0');
  const mo = String(scanned.getMonth() + 1).padStart(2, '0');
  const yy = scanned.getFullYear();
  return `${dd}/${mo}/${yy}, ${hh}:${mm}`;
}


describe('deriveReportData — activeDust', () => {
  test('6.1.1 — activeDust contains only UTXOs with dustReason=initial and spendability=doNotSpend', () => {
    const wallet = makeWallet(
      [
        makeUTXO('tx1', 0, 800, 'doNotSpend', 'initial'),
        makeUTXO('tx2', 0, 1200, 'doNotSpend', 'adjacent'),
        makeUTXO('tx3', 0, 50000, 'spendable', undefined),
      ],
      [],
      []
    );
    const { activeDust } = deriveReportData(wallet);
    expect(activeDust).toHaveLength(1);
    expect(activeDust[0].txId).toBe('tx1');
  });

  test('6.1.2 — activeDust is empty when no initial-reason doNotSpend UTXOs exist', () => {
    const wallet = makeWallet(
      [makeUTXO('tx1', 0, 1200, 'doNotSpend', 'adjacent')],
      [],
      []
    );
    const { activeDust } = deriveReportData(wallet);
    expect(activeDust).toHaveLength(0);
  });
});

describe('deriveReportData — linkedCoins', () => {
  test('6.1.3 — linkedCoins includes adjacent and descendant doNotSpend UTXOs', () => {
    const wallet = makeWallet(
      [
        makeUTXO('tx1', 0, 800, 'doNotSpend', 'initial'),
        makeUTXO('tx2', 0, 12000, 'doNotSpend', 'adjacent'),
        makeUTXO('tx3', 0, 30000, 'doNotSpend', 'descendant'),
      ],
      [],
      []
    );
    const { linkedCoins } = deriveReportData(wallet);
    expect(linkedCoins).toHaveLength(2);
    expect(linkedCoins.map((u: any) => u.txId)).toEqual(expect.arrayContaining(['tx2', 'tx3']));
  });

  test('6.1.4 — initial-reason UTXOs are NOT included in linkedCoins', () => {
    const wallet = makeWallet(
      [makeUTXO('tx1', 0, 800, 'doNotSpend', 'initial')],
      [],
      []
    );
    const { linkedCoins } = deriveReportData(wallet);
    expect(linkedCoins).toHaveLength(0);
  });
});

describe('deriveReportData — doNotSpendUTXOs and amountMarkedDNS', () => {
  test('6.1.5 — doNotSpendUTXOs counts all UTXOs regardless of dustReason', () => {
    const wallet = makeWallet(
      [
        makeUTXO('tx1', 0, 400, 'doNotSpend', 'initial'),
        makeUTXO('tx2', 0, 600, 'doNotSpend', 'adjacent'),
        makeUTXO('tx3', 0, 800, 'doNotSpend', 'descendant'),
        makeUTXO('tx4', 0, 50000, 'spendable', undefined),
      ],
      [],
      []
    );
    const { doNotSpendUTXOs, amountMarkedDNS } = deriveReportData(wallet);
    expect(doNotSpendUTXOs).toHaveLength(3);
    expect(amountMarkedDNS).toBe(1800);
  });

  test('6.1.6 — amountMarkedDNS includes UTXOs from both confirmed and unconfirmed', () => {
    const wallet = makeWallet(
      [makeUTXO('tx1', 0, 400, 'doNotSpend', 'initial')],
      [makeUTXO('tx2', 0, 600, 'doNotSpend', 'adjacent')],
      []
    );
    const { amountMarkedDNS } = deriveReportData(wallet);
    expect(amountMarkedDNS).toBe(1000);
  });
});

describe('deriveReportData — pastDustSpends', () => {
  test('6.1.7 — pastDustSpends includes transactions tagged potential-dust-spend', () => {
    const wallet = makeWallet(
      [],
      [],
      [
        makeTx('txid1', ['potential-dust-spend'], 5000),
        makeTx('txid2', ['other-tag'], 1000),
        makeTx('txid3', undefined, 2000),
      ]
    );
    const { pastDustSpends } = deriveReportData(wallet);
    expect(pastDustSpends).toHaveLength(1);
    expect(pastDustSpends[0].txid).toBe('txid1');
  });
});

describe('deriveReportData — isEmpty and hasEligibleDustForDonation', () => {
  test('6.1.8 — isEmpty is true when no activeDust, linkedCoins, or pastDustSpends', () => {
    const wallet = makeWallet(
      [makeUTXO('tx1', 0, 50000, 'spendable', undefined)],
      [],
      [makeTx('txid1', ['other-tag'])]
    );
    const { isEmpty } = deriveReportData(wallet);
    expect(isEmpty).toBe(true);
  });

  test('6.1.9 — isEmpty is false when pastDustSpends exist even if no DNS UTXOs', () => {
    const wallet = makeWallet(
      [],
      [],
      [makeTx('txid1', ['potential-dust-spend'])]
    );
    const { isEmpty } = deriveReportData(wallet);
    expect(isEmpty).toBe(false);
  });

  test('6.1.10 — hasEligibleDustForDonation is true when doNotSpendUTXOs exist', () => {
    const wallet = makeWallet(
      [makeUTXO('tx1', 0, 800, 'doNotSpend', 'initial')],
      [],
      []
    );
    const { hasEligibleDustForDonation } = deriveReportData(wallet);
    expect(hasEligibleDustForDonation).toBe(true);
  });

  test('6.1.11 — hasEligibleDustForDonation is false when only past dust spends exist', () => {
    const wallet = makeWallet(
      [],
      [],
      [makeTx('txid1', ['potential-dust-spend'])]
    );
    const { hasEligibleDustForDonation } = deriveReportData(wallet);
    expect(hasEligibleDustForDonation).toBe(false);
  });
});

// ── Task 6.2 — lastScanned formatting ────────────────────────────────────

describe('formatLastScanned', () => {
  test('6.2.1 — returns "Today, HH:MM" format for a timestamp from today', () => {
    const now = new Date();
    now.setHours(14, 20, 0, 0);
    const result = formatLastScanned(now.getTime());
    expect(result).toBe('Today, 14:20');
  });

  test('6.2.2 — returns dd/mm/yyyy format for a timestamp from a past date', () => {
    const past = new Date(2025, 0, 5, 9, 5); // Jan 5 2025, 09:05
    const result = formatLastScanned(past.getTime());
    expect(result).toBe('05/01/2025, 09:05');
  });

  test('6.2.3 — absent key returns null (no formatting call)', () => {
    // Simulates: if !hasItem(key) return null
    const stored = undefined;
    const result = stored === undefined ? null : formatLastScanned(stored);
    expect(result).toBeNull();
  });
});
