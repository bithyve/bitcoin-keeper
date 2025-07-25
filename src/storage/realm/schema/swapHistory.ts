import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const SwapHistorySchema: ObjectSchema = {
  name: RealmSchema.SwapHistory,
  properties: {
    coin_from: 'string',
    coin_from_name: 'string',
    coin_from_network: 'string',
    coin_to: 'string',
    coin_to_name: 'string',
    coin_to_network: 'string',
    created_at: 'int',
    deposit_amount: 'string',
    expired_at: 'int',
    is_float: 'bool',
    status: 'string',
    id: 'string',
    withdrawal_amount: 'string',
  },
};
