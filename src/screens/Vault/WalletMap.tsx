import { SignerStorage, SignerType } from 'src/core/wallets/enums';

import COLDCARDICON from 'src/assets/images/coldcard_icon.svg';
import COLDCARDICONLIGHT from 'src/assets/icons/coldcard_light.svg';
import COLDCARDLOGO from 'src/assets/images/coldcard_logo.svg';
import JADEICON from 'src/assets/images/jade_icon.svg';
import JADEICONLIGHT from 'src/assets/images/jade_icon_light.svg';
import JADELOGO from 'src/assets/images/jade_logo.svg';
import KEEPERAPP from 'src/assets/icons/KeeperIcon.svg';
import KEEPERAPPLIGHT from 'src/assets/icons/KeeperIconLight.svg';
import KEYSTONEICON from 'src/assets/images/keystone_icon.svg';
import KEYSTONEICONLIGHT from 'src/assets/images/keystone_icon_light.svg';
import KEYSTONELOGO from 'src/assets/images/keystone_logo.svg';
import LEDGERICON from 'src/assets/images/ledger_icon.svg';
import LEDGERICONLIGHT from 'src/assets/icons/ledger_light.svg';
import LEDGERLOGO from 'src/assets/images/ledger_logo.svg';
import MOBILEKEY from 'src/assets/images/mobile_key.svg';
import MOBILEKEYLIGHT from 'src/assets/images/svgs/mobile_key_light.svg';
import PASSPORTICON from 'src/assets/images/passport_icon.svg';
import PASSPORTICONLIGHT from 'src/assets/images/passport_light.svg';
import PASSPORTLOGO from 'src/assets/images/passport_logo.svg';
import React from 'react';
import SEEDSIGNERICON from 'src/assets/icons/seedsigner_icon.svg';
import SEEDSIGNERICONLIGHT from 'src/assets/icons/seedsigner_light.svg';
import SEEDSIGNERLOGO from 'src/assets/images/seedsignerlogo.svg';
import SEEDWORDS from 'src/assets/icons/seedwords.svg';
import SEEDWORDSLIGHT from 'src/assets/icons/seedwordsLight.svg';
import SERVER from 'src/assets/images/server.svg';
import SERVERLIGHT from 'src/assets/icons/server_light.svg';
import TAPSIGNERICON from 'src/assets/images/tapsigner_icon.svg';
import TAPSIGNERICONLIGHT from 'src/assets/icons/tapsigner_light.svg';
import TAPSIGNERLOGO from 'src/assets/images/tapsigner_logo.svg';
import TREZORICON from 'src/assets/images/trezor_icon.svg';
import TREZORICONLIGHT from 'src/assets/icons/trezor_light.svg';
import TREZORLOGO from 'src/assets/images/trezor_logo.svg';
import Text from 'src/components/KeeperText';

const getColouredIcon = (LightComponent, DarkComponent, isLight) => {
  if (isLight) {
    return LightComponent;
  }
  return DarkComponent;
};

export const WalletMap = (type: SignerType, light = false) => {
  switch (type) {
    case SignerType.COLDCARD:
      return {
        Icon: getColouredIcon(<COLDCARDICONLIGHT />, <COLDCARDICON />, light),
        Logo: <COLDCARDLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.JADE:
      return {
        Icon: getColouredIcon(<JADEICONLIGHT />, <JADEICON />, light),
        Logo: <JADELOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.KEEPER:
      return {
        Icon: getColouredIcon(<KEEPERAPPLIGHT />, <KEEPERAPP />, light),
        Logo: (
          <Text letterSpacing={1.5} fontWeight={200} fontSize={14} color="light.secondaryText">
            Another Keeper App
          </Text>
        ),
      };
    case SignerType.KEYSTONE:
      return {
        Icon: getColouredIcon(<KEYSTONEICONLIGHT />, <KEYSTONEICON />, light),
        Logo: <KEYSTONELOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.LEDGER:
      return {
        Icon: getColouredIcon(<LEDGERICONLIGHT />, <LEDGERICON />, light),
        Logo: <LEDGERLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.MOBILE_KEY:
      return {
        Icon: getColouredIcon(<MOBILEKEYLIGHT />, <MOBILEKEY />, light),
        Logo: (
          <Text letterSpacing={1.5} fontWeight={200} fontSize={14} color="light.secondaryText">
            Mobile Key
          </Text>
        ),
        type: SignerStorage.HOT,
      };
    case SignerType.PASSPORT:
      return {
        Icon: getColouredIcon(<PASSPORTICONLIGHT />, <PASSPORTICON />, light),
        Logo: <PASSPORTLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.POLICY_SERVER:
      return {
        Icon: getColouredIcon(<SERVERLIGHT />, <SERVER />, light),
        Logo: (
          <Text letterSpacing={1.5} fontWeight={200} fontSize={14} color="light.secondaryText">
            Signing Server
          </Text>
        ),
        type: SignerStorage.HOT,
      };
    case SignerType.TAPSIGNER:
      return {
        Icon: getColouredIcon(<TAPSIGNERICONLIGHT />, <TAPSIGNERICON />, light),
        Logo: <TAPSIGNERLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.TREZOR:
      return {
        Icon: getColouredIcon(<TREZORICONLIGHT />, <TREZORICON />, light),
        Logo: <TREZORLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.SEEDSIGNER:
      return {
        Icon: getColouredIcon(<SEEDSIGNERICONLIGHT />, <SEEDSIGNERICON />, light),
        Logo: <SEEDSIGNERLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.SEED_WORDS:
      return {
        Icon: getColouredIcon(<SEEDWORDSLIGHT />, <SEEDWORDS />, light),
        Logo: (
          <Text letterSpacing={1.5} fontWeight={200} fontSize={14} color="light.secondaryText">
            Soft Key
          </Text>
        ),
        type: SignerStorage.WARM,
      };
    default:
      return {
        Icon: null,
        Logo: null,
        type: SignerStorage.COLD,
      };
  }
};
