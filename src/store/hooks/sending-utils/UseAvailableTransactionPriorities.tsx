// taken from hexa (hooks)

import { useMemo } from 'react';
import { TxPriority } from 'src/core/wallets/enums/index';
// import useSendingState from '../state-selectors/sending/UseSendingState'
const defaultTransactionPrioritiesAvailable = [TxPriority.LOW, TxPriority.MEDIUM, TxPriority.HIGH];

export default function useAvailableTransactionPriorities() {
  //   const sendingState = useSendingState();
  //   return useMemo(() => {
  //     let availablePriorities = defaultTransactionPrioritiesAvailable;
  //     if (sendingState.feeIntelMissing) availablePriorities = [];
  //     else if (sendingState.sendMaxFee) availablePriorities = [TxPriority.LOW];
  //     return availablePriorities;
  //   }, [sendingState.feeIntelMissing, sendingState.sendMaxFee]);
}
