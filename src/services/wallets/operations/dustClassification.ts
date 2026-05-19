import { TransactionType } from 'src/services/wallets/enums';
import { UTXO, UTXOSpendability } from 'src/services/wallets/interfaces';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';

const DUST_THRESHOLD_SATS = 5000;

/**
 * Classifies a UTXO as 'spendable' or 'doNotSpend' based on dust heuristics.
 *
 * @param utxo                          The UTXO to classify.
 * @param synchedWallet                 The post-sync wallet/vault state (used for address cache + tx history).
 * @param preSyncNextFreeAddressIndex   The wallet's nextFreeAddressIndex captured BEFORE the sync call.
 */
export function classifyDustUTXO(
  utxo: UTXO,
  synchedWallet: Wallet | Vault,
  preSyncNextFreeAddressIndex: number
): UTXOSpendability {
  // Fast-exit: anything at or above the dust threshold is always spendable
  if (utxo.value >= DUST_THRESHOLD_SATS) {
    return 'spendable';
  }

  const { addresses, transactions } = synchedWallet.specs as any;

  if (!addresses) {
    return 'spendable';
  }

  const external: Record<string, string> = addresses.external || {};
  const internal: Record<string, string> = addresses.internal || {};

  // --- Receive (external) address ---
  const externalEntry = Object.entries(external).find(([, addr]) => addr === utxo.address);
  if (externalEntry) {
    const addressIndex = parseInt(externalEntry[0], 10);

    const receiveCount = (transactions || []).filter(
      (tx: any) => tx.address === utxo.address && tx.transactionType === TransactionType.RECEIVED
    ).length;

    const hasReceivedBefore = receiveCount > 1;
    const highestReceivedIdx = preSyncNextFreeAddressIndex - 1;
    const isOutOfOrder = addressIndex < highestReceivedIdx;

    if (hasReceivedBefore || isOutOfOrder) {
      return 'doNotSpend';
    }
    return 'spendable';
  }

  // --- Change (internal) address ---
  const internalEntry = Object.entries(internal).find(([, addr]) => addr === utxo.address);
  if (internalEntry) {
    const receiveCount = (transactions || []).filter(
      (tx: any) => tx.address === utxo.address && tx.transactionType === TransactionType.RECEIVED
    ).length;

    const hasReceivedBefore = receiveCount > 1;

    if (hasReceivedBefore) {
      return 'doNotSpend';
    }
    return 'spendable';
  }

  // Unknown address — safe default
  return 'spendable';
}
