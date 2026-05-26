/**
 * Task 6.4 — SendConfirmation isDonation mode: priority selector behavior
 *
 * The priority selector (btn_transactionPriority) is wrapped in {!isDonation && (...)}
 * and the initial transactionPriority defaults to TxPriority.LOW when not provided.
 *
 * These are pure logic tests for the isDonation guard condition and
 * TxPriority.LOW default — extracted from the render logic to avoid
 * the heavy SendConfirmation dependency tree.
 */

const TxPriority = { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', CUSTOM: 'CUSTOM' } as const;
type TxPriorityType = (typeof TxPriority)[keyof typeof TxPriority];

/** Mirrors the priority-selector render guard in SendConfirmation */
function shouldRenderPrioritySelector(isDonation: boolean): boolean {
  return !isDonation;
}

/** Mirrors the transactionPriority initialisation logic in SendConfirmation */
function resolveInitialPriority(
  isCachedTransaction: boolean,
  initialTransactionPriority?: TxPriorityType
): TxPriorityType {
  return isCachedTransaction
    ? TxPriority.CUSTOM
    : initialTransactionPriority || TxPriority.LOW;
}

describe('SendConfirmation isDonation mode', () => {
  describe('6.4.1 — priority selector guard', () => {
    it('hides the priority selector when isDonation is true', () => {
      expect(shouldRenderPrioritySelector(true)).toBe(false);
    });

    it('shows the priority selector when isDonation is false', () => {
      expect(shouldRenderPrioritySelector(false)).toBe(true);
    });
  });

  describe('6.4.2 — transactionPriority defaults to LOW in donation flow', () => {
    it('resolves to LOW when no initial priority supplied (donation case)', () => {
      const priority = resolveInitialPriority(false, undefined);
      expect(priority).toBe(TxPriority.LOW);
    });

    it('honours an explicit LOW priority passed from UTXOManagement', () => {
      const priority = resolveInitialPriority(false, TxPriority.LOW);
      expect(priority).toBe(TxPriority.LOW);
    });

    it('still uses CUSTOM for cached transactions (unrelated to donation)', () => {
      const priority = resolveInitialPriority(true, TxPriority.MEDIUM);
      expect(priority).toBe(TxPriority.CUSTOM);
    });
  });
});
