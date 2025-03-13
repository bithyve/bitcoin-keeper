import { Subscription } from 'react-native-iap';

export default interface SubScription {
  name: string;
  productId: string;
  receipt?: string;
  level: number;
  icon: string;
  isDesktopPurchase?: boolean;
}

export type SubScriptionPlan = {
  name: string;
  icon: string;
  iconFocused: string;
  isActive: boolean;
  benifits: string[];
  comingSoon: boolean;
  productType: string;
  subTitle: string;
  trailPeriod?: string;
  productIds: string[];
  planDetails: Subscription;
  monthlyPlanDetails?: {
    productId: string;
    offerToken?: string;
    price?: string;
    currency?: string;
    trailPeriod?: string;
  };
  yearlyPlanDetails?: {
    productId: string;
    offerToken?: string;
    price?: string;
    currency?: string;
    trailPeriod?: string;
  };
  promoCodes?: {
    [code: string]: string;
  };
};
