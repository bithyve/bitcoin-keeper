import { UTXO } from 'src/services/wallets/interfaces';

export function getDonateDustSummaryMeta(doNotSpendUTXOs: UTXO[]) {
  const coinCount = doNotSpendUTXOs.length;
  const totalSatsBeforeFees = doNotSpendUTXOs.reduce((sum, utxo) => sum + utxo.value, 0);
  const hasManualDoNotSpendCoins = doNotSpendUTXOs.some((utxo) => !!utxo.isManualOverride);

  return {
    coinCount,
    totalSatsBeforeFees,
    hasManualDoNotSpendCoins,
  };
}

export function formatDonateDustSummary(
  template: string,
  coinCount: number,
  totalSatsBeforeFees: number
) {
  return template
    .replace('{count}', String(coinCount))
    .replace('{amount}', String(totalSatsBeforeFees));
}