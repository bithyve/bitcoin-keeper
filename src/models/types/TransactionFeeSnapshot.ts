import { Satoshis } from './UnitAliases';

type TransactionFeeSnapshot = {
  amount: Satoshis;
  estimatedBlocksBeforeConfirmation: number;
};

export default TransactionFeeSnapshot;
