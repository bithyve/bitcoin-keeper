// taken from hexa (hooks)

import { useMemo } from 'react';
import { TxPriority } from 'src/services/wallets/enums/index';
// import useSendingState from '../state-selectors/sending/UseSendingState'
const defaultTransactionPrioritiesAvailable = [
  TxPriority.HIGH,
  TxPriority.MEDIUM,
  TxPriority.LOW,
  TxPriority.CUSTOM,
];

export default function useAvailableTransactisonPriorities() {
  return defaultTransactionPrioritiesAvailable;
  //   const sendingState = useSendingState();
  //   return useMemo(() => {
  // let availablePriorities = defaultTransactionPrioritiesAvailable;
  //     if (sendingState.feeIntelMissing) availablePriorities = [];
  //     else if (sendingState.sendMaxFee) availablePriorities = [TxPriority.LOW];
  //     return availablePriorities;
  //   }, [sendingState.feeIntelMissing, sendingState.sendMaxFee]);
}
