import { ImageSourcePropType } from 'react-native';
import { WalletType } from 'src/core/wallets/enums';
import RecipientKind from '../../enums/RecipientKind';
import { Satoshis } from '../../typealiases/UnitAliases';

export interface Recipient {
  id: string;
  kind: RecipientKind;
  displayedName: string;
  amount?: Satoshis;
  avatarImageSource: ImageSourcePropType | null;
}

export type AddressRecipient = Recipient;

export interface WalletRecipient extends Recipient {
  /**
   * Current balance of the account in Satoshis.
   */
  id: string;
  currentBalance: Satoshis;
  type: WalletType;
}
