import { ObjectSchema } from 'realm';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { RealmSchema } from '../enum';

export const StoreSubscriptionSchema: ObjectSchema = {
  name: RealmSchema.StoreSubscription,
  properties: {
    name: {
      type: 'string',
      default: SubscriptionTier.L1,
    },
    productId: {
      type: 'string',
      default: SubscriptionTier.L1,
    },
    receipt: {
      type: 'string?',
      default: '',
    },
    level: {
      type: 'int',
      default: 0,
    },
    isDesktopPurchase: {
      type: 'bool',
      default: false,
    },
  },
};
