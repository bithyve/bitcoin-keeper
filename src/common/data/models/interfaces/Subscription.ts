import { Subscription } from 'react-native-iap';

export default interface SubScription {
  name: string;
  productId: string;
  receipt?: string;
  level: number;
  icon: string;
}

export type SubScriptionPlan = {
  name: string;
  icon: string;
  iconFocused: string;
  isActive: boolean;
  benifits: string[];
  productType: string;
  subTitle: string;
  trailPeriod?: string;
  productIds: string[];
  planDetails: Subscription;
};
