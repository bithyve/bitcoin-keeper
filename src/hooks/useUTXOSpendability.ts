import { useMemo } from 'react';
import { UTXOSpendability } from 'src/services/wallets/interfaces';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';

export function useUTXOSpendability(wallet: Wallet | Vault | null) {
  const utxoSpendabilityMap = useMemo(() => {
    const map = new Map<string, UTXOSpendability>();
    if (!wallet) return map;
    const specs = (wallet as any).specs;
    if (!specs) return map;
    const allUTXOs = [...(specs.confirmedUTXOs || []), ...(specs.unconfirmedUTXOs || [])];
    for (const utxo of allUTXOs) {
      if (utxo.spendability) {
        map.set(`${utxo.txId}:${utxo.vout}`, utxo.spendability as UTXOSpendability);
      }
    }
    return map;
  }, [wallet]);

  const hasDoNotSpendUTXOs = useMemo(
    () => Array.from(utxoSpendabilityMap.values()).some((s) => s === 'doNotSpend'),
    [utxoSpendabilityMap]
  );

  const getSpendability = (txId: string, vout: number): UTXOSpendability | null => {
    return utxoSpendabilityMap.get(`${txId}:${vout}`) ?? null;
  };

  return { hasDoNotSpendUTXOs, getSpendability };
}

export default useUTXOSpendability;
