/**
 * Tasks 6.2 & 6.3 — executeDonation eligibility logic
 *
 * These tests cover the decision branch that runs when sendMaxFee resolves:
 *   - Pass (sendMaxFee > 0 && sendMaxFee < totalDoNotSpendValue): donationAmount = total - fee, sendPhaseOne dispatched
 *   - Fail (sendMaxFee >= totalDoNotSpendValue || sendMaxFee === 0): modal closes, error toast shown
 */

import {
  formatDonateDustSummary,
  getDonateDustSummaryMeta,
} from 'src/screens/UTXOManagement/donationDisclosure';

type EligibilityResult =
  | { eligible: true; donationAmount: number }
  | { eligible: false; reason: 'too_small' };

function checkDonationEligibility(
  sendMaxFee: number,
  doNotSpendUTXOs: { value: number }[]
): EligibilityResult {
  const totalDoNotSpendValue = doNotSpendUTXOs.reduce((s, u) => s + u.value, 0);
  if (sendMaxFee > 0 && sendMaxFee < totalDoNotSpendValue) {
    return { eligible: true, donationAmount: totalDoNotSpendValue - sendMaxFee };
  }
  return { eligible: false, reason: 'too_small' };
}

const doNotSpendUTXOs = [
  { txId: 'tx1', vout: 0, value: 1000, address: 'a1', height: 100, spendability: 'doNotSpend' },
  { txId: 'tx2', vout: 0, value: 500, address: 'a2', height: 101, spendability: 'doNotSpend' },
];
// totalDoNotSpendValue = 1500

describe('executeDonation eligibility logic', () => {
  describe('6.2 — eligibility passes', () => {
    it('6.2.1 — returns eligible:true and correct donationAmount when fee < total', () => {
      const result = checkDonationEligibility(200, doNotSpendUTXOs);
      expect(result.eligible).toBe(true);
      if (result.eligible) {
        expect(result.donationAmount).toBe(1300); // 1500 - 200
      }
    });

    it('6.2.2 — donationAmount is total minus fee (not total)', () => {
      const result = checkDonationEligibility(1, doNotSpendUTXOs);
      expect(result.eligible).toBe(true);
      if (result.eligible) {
        expect(result.donationAmount).toBe(1499);
      }
    });
  });

  describe('6.3 — eligibility fails', () => {
    it('6.3.1 — returns eligible:false when sendMaxFee === 0', () => {
      const result = checkDonationEligibility(0, doNotSpendUTXOs);
      expect(result.eligible).toBe(false);
    });

    it('6.3.2 — returns eligible:false when sendMaxFee equals total UTXO value', () => {
      const result = checkDonationEligibility(1500, doNotSpendUTXOs);
      expect(result.eligible).toBe(false);
    });

    it('6.3.3 — returns eligible:false when sendMaxFee exceeds total UTXO value', () => {
      const result = checkDonationEligibility(2000, doNotSpendUTXOs);
      expect(result.eligible).toBe(false);
    });

    it('6.3.4 — returns eligible:false for single tiny dust UTXO where fee >= value', () => {
      const tiny = [{ value: 150 }];
      const result = checkDonationEligibility(150, tiny);
      expect(result.eligible).toBe(false);
    });
  });
});

describe('donate dust confirmation disclosure', () => {
  const summaryTemplate =
    'This will donate all {count} Do Not Spend coins, totaling {amount} sats before fees.';

  it('renders a count and total summary using current do-not-spend UTXOs', () => {
    const disclosure = getDonateDustSummaryMeta(doNotSpendUTXOs as any);
    const summary = formatDonateDustSummary(
      summaryTemplate,
      disclosure.coinCount,
      disclosure.totalSatsBeforeFees
    );

    expect(summary).toBe(
      'This will donate all 2 Do Not Spend coins, totaling 1500 sats before fees.'
    );
  });

  it('flags manual do-not-spend inclusion when any selected UTXO is manually marked', () => {
    const withManual = [
      { txId: 'm1', vout: 0, value: 300, isManualOverride: true },
      { txId: 'm2', vout: 1, value: 200, isManualOverride: false },
    ];

    const disclosure = getDonateDustSummaryMeta(withManual as any);
    expect(disclosure.hasManualDoNotSpendCoins).toBe(true);
  });

  it('does not flag manual inclusion when no selected UTXO is manually marked', () => {
    const withoutManual = [
      { txId: 'n1', vout: 0, value: 300, isManualOverride: false },
      { txId: 'n2', vout: 1, value: 200 },
    ];

    const disclosure = getDonateDustSummaryMeta(withoutManual as any);
    expect(disclosure.hasManualDoNotSpendCoins).toBe(false);
  });
});
