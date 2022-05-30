import { ObjectSchema } from 'realm';

export const WalletSchema: ObjectSchema = {
  name: 'Wallet',
  embedded: true,
  properties: {
    id: 'string',
    type: 'string',
    isUsable: 'bool',
    // derivationDetails: WalletDerivationDetails;
    // presentationData: WalletPresentationData;
    // specs: WalletSpecs;
  },
};
