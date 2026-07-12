import { Transaction } from 'src/services/wallets/interfaces';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';

const DUST_THRESHOLD_SATS = 5000;

/**
 * Classifies wallet addresses as tainted using an address-level taint model.
 *
 * Two scan modes are supported:
 *  - 'current'  (soft/hard refresh): evaluates only the current confirmed and unconfirmed
 *               UTXO set. Fast and lightweight — no walletOutputs history required.
 *               Phases 2 (BFS) and 3 (tx labels) are skipped.
 *  - 'full'     (dust scan): scans walletOutputs across all transaction history to find
 *               initially tainted addresses (including already-spent dust), then propagates
 *               taint forward via BFS and emits dustSpendTxids.
 *
 * @param wallet                    Post-sync wallet/vault state.
 * @param externalAddresses         { address → derivation index } map for external chain.
 * @param internalAddresses         { address → derivation index } map for internal chain.
 * @param manualOverrideAddresses   Addresses where any UTXO has isManualOverride: true.
 *                                  The BFS propagation chain is broken at these addresses.
 * @param scanMode                  'current' for soft/hard refresh; 'full' for explicit dust scan.
 */
export function classifyDustByAddress(
  wallet: Wallet | Vault,
  externalAddresses: Record<string, number>,
  internalAddresses: Record<string, number>,
  manualOverrideAddresses: Set<string>,
  scanMode: 'current' | 'full'
): {
  taintedAddresses: Set<string>;
  initialTaintAddresses: Set<string>;
  dustSpendTxids: Set<string>;
} {
  const transactions: Transaction[] = (wallet.specs as any).transactions || [];

  // ── Phase 0: Pre-compute historical address-state indexes ────────────────
  // Sort ascending by blockTime; unconfirmed (undefined blockTime) sort last.
  const sorted = [...transactions].sort((a, b) => {
    const at = a.blockTime ?? Number.MAX_SAFE_INTEGER;
    const bt = b.blockTime ?? Number.MAX_SAFE_INTEGER;
    return at - bt;
  });

  // txCountByAddress[addr] = number of distinct transactions that include addr in recipientAddresses.
  // Any address with count > 1 has been reused regardless of block timing.
  const txCountByAddress = new Map<string, number>();
  for (const tx of transactions) {
    for (const addr of tx.recipientAddresses ?? []) {
      txCountByAddress.set(addr, (txCountByAddress.get(addr) ?? 0) + 1);
    }
  }

  // highestExtIdxBeforeTx[txid] = highest external derivation index seen in *earlier* txs
  const highestExtIdxBeforeTx = new Map<string, number>();

  let runningHighestExtIdx = -1;
  for (const tx of sorted) {
    highestExtIdxBeforeTx.set(tx.txid, runningHighestExtIdx);
    for (const addr of tx.recipientAddresses ?? []) {
      const extIdx = externalAddresses[addr];
      if (extIdx !== undefined && extIdx > runningHighestExtIdx) {
        runningHighestExtIdx = extIdx;
      }
    }
  }

  // ── Phase 1: Initial taint detection ─────────────────────────────────────
  const initialTaintAddresses = new Set<string>();

  if (scanMode === 'current') {
    // Lightweight mode: check only current UTXOs directly (no walletOutputs history scan).
    const currentUTXOs = [
      ...((wallet.specs as any).confirmedUTXOs || []),
      ...((wallet.specs as any).unconfirmedUTXOs || []),
    ];
    for (const utxo of currentUTXOs) {
      if ((utxo.value as number) >= DUST_THRESHOLD_SATS) continue;
      const address = utxo.address as string;

      if (externalAddresses[address] !== undefined) {
        const addrIdx = externalAddresses[address];
        const isReused = (txCountByAddress.get(address) ?? 0) > 1;
        const highestBefore = highestExtIdxBeforeTx.get(utxo.txId as string) ?? -1;
        const isOutOfOrder = addrIdx < highestBefore;
        if (isReused || isOutOfOrder) {
          initialTaintAddresses.add(address);
        }
      } else if (internalAddresses[address] !== undefined) {
        const isReused = (txCountByAddress.get(address) ?? 0) > 1;
        if (isReused) {
          initialTaintAddresses.add(address);
        }
      }
    }

    // 'current' mode: no BFS, no tx labels — return early.
    return {
      taintedAddresses: new Set(initialTaintAddresses),
      initialTaintAddresses,
      dustSpendTxids: new Set(),
    };
  }

  // Full mode: scan walletOutputs across all transaction history.
  for (const tx of sorted) {
    const walletOutputs = (tx as any).walletOutputs as
      | Array<{ address: string; valueSats: number }>
      | undefined;
    if (!walletOutputs || walletOutputs.length === 0) continue;

    for (const { address, valueSats } of walletOutputs) {
      if (valueSats >= DUST_THRESHOLD_SATS) continue;

      if (externalAddresses[address] !== undefined) {
        // External (receive) address
        const addrIdx = externalAddresses[address];
        const isReused = (txCountByAddress.get(address) ?? 0) > 1;
        const highestBefore = highestExtIdxBeforeTx.get(tx.txid) ?? -1;
        const isOutOfOrder = addrIdx < highestBefore;

        if (isReused || isOutOfOrder) {
          initialTaintAddresses.add(address);
        }
      } else if (internalAddresses[address] !== undefined) {
        // Internal (change) address — reuse check only
        const isReused = (txCountByAddress.get(address) ?? 0) > 1;

        if (isReused) {
          initialTaintAddresses.add(address);
        }
      }
    }
  }

  // ── Phase 2: BFS forward propagation ─────────────────────────────────────
  // Build sender-address → [transactions] index for efficient BFS lookups.
  const senderToTxs = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    for (const addr of tx.senderAddresses ?? []) {
      if (!senderToTxs.has(addr)) senderToTxs.set(addr, []);
      senderToTxs.get(addr)!.push(tx);
    }
  }

  const taintedAddresses = new Set<string>(initialTaintAddresses);
  // Seed frontier with initially-tainted addresses that have no manual override.
  let queue = [...initialTaintAddresses].filter(
    (addr) => !manualOverrideAddresses.has(addr)
  );
  const enqueued = new Set<string>(queue);

  while (queue.length > 0) {
    const nextQueue: string[] = [];
    for (const taintedAddr of queue) {
      for (const tx of senderToTxs.get(taintedAddr) ?? []) {
        for (const recipientAddr of tx.recipientAddresses ?? []) {
          // Only propagate to wallet-owned addresses.
          if (
            externalAddresses[recipientAddr] === undefined &&
            internalAddresses[recipientAddr] === undefined
          ) {
            continue;
          }
          if (taintedAddresses.has(recipientAddr)) continue;

          taintedAddresses.add(recipientAddr);

          // Only use this address as a future frontier node if not manually overridden.
          if (!manualOverrideAddresses.has(recipientAddr) && !enqueued.has(recipientAddr)) {
            enqueued.add(recipientAddr);
            nextQueue.push(recipientAddr);
          }
        }
      }
    }
    queue = nextQueue;
  }

  // ── Phase 3: Transaction label output ────────────────────────────────────
  const dustSpendTxids = new Set<string>();
  for (const tx of transactions) {
    for (const addr of tx.senderAddresses ?? []) {
      if (taintedAddresses.has(addr)) {
        dustSpendTxids.add(tx.txid);
        break;
      }
    }
  }

  return { taintedAddresses, initialTaintAddresses, dustSpendTxids };
}

