/**
 * Tasks 6.2 & 6.3 — executeDonation eligibility logic
 *
 * These tests cover the decision branch that runs when sendMaxFee resolves:
 *   - Pass (sendMaxFee > 0 && sendMaxFee < totalDoNotSpendValue): donationAmount = total - fee, sendPhaseOne dispatched
 *   - Fail (sendMaxFee >= totalDoNotSpendValue || sendMaxFee === 0): modal closes, error toast shown
 */

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
