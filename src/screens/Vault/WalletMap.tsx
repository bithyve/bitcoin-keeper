import { SignerStorage, SignerType } from 'src/core/wallets/enums';

import COLDCARDICON from 'src/assets/images/coldcard_icon.svg';
import COLDCARDICONLIGHT from 'src/assets/icons/coldcard_light.svg';
import COLDCARDLOGO from 'src/assets/images/coldcard_logo.svg';
import JADEICON from 'src/assets/images/jade_icon.svg';
import JADELOGO from 'src/assets/images/jade_logo.svg';
import KEYSTONEICON from 'src/assets/images/keystone_icon.svg';
import KEYSTONELOGO from 'src/assets/images/keystone_logo.svg';
import LEDGERICON from 'src/assets/images/ledger_icon.svg';
import LEDGERICONLIGHT from 'src/assets/icons/ledger_light.svg';
import LEDGERLOGO from 'src/assets/images/ledger_logo.svg';
import MOBILEKEY from 'src/assets/images/mobile_key.svg';
import MOBILEKEYLIGHT from 'src/assets/images/svgs/mobile_key_light.svg';
import PASSPORTICON from 'src/assets/images/passport_icon.svg';
import PASSPORTLOGO from 'src/assets/images/passport_logo.svg';
import React from 'react';
import SEEDWORDSICON from 'src/assets/images/seedwords_icon.svg';
import SERVER from 'src/assets/images/server.svg';
import SERVERLIGHT from 'src/assets/icons/server_light.svg';
import TAPSIGNERICON from 'src/assets/images/tapsigner_icon.svg';
import TAPSIGNERICONLIGHT from 'src/assets/icons/tapsigner_light.svg';
import TAPSIGNERLOGO from 'src/assets/images/tapsigner_logo.svg';
import TREZORICON from 'src/assets/images/trezor_icon.svg';
import TREZORICONLIGHT from 'src/assets/icons/trezor_light.svg';
import TREZORLOGO from 'src/assets/images/trezor_logo.svg';
import { Text } from 'native-base';

export const WalletMap = (type: SignerType, light = false) => {
  switch (type) {
    case SignerType.COLDCARD:
      return {
        Icon: light ? <COLDCARDICONLIGHT /> : <COLDCARDICON />,
        Logo: <COLDCARDLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.JADE:
      return {
        Icon: <JADEICON />,
        Logo: <JADELOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.KEEPER:
      return {
        Icon: null,
        Logo: (
          <Text letterSpacing={1.5} fontWeight={200} fontSize={14} color={'light.lightBlack2'}>
            Another Keeper App
          </Text>
        ),
      };
    case SignerType.KEYSTONE:
      return {
        Icon: <KEYSTONEICON />,
        Logo: <KEYSTONELOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.LEDGER:
      return {
        Icon: light ? <LEDGERICONLIGHT /> : <LEDGERICON />,
        Logo: <LEDGERLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.MOBILE_KEY:
      return {
        Icon: light ? <MOBILEKEYLIGHT /> : <MOBILEKEY />,
        Logo: (
          <Text letterSpacing={1.5} fontWeight={200} fontSize={14} color={'light.lightBlack2'}>
            Mobile Key
          </Text>
        ),
        type: SignerStorage.HOT,
      };
    case SignerType.PASSPORT:
      return {
        Icon: <PASSPORTICON />,
        Logo: <PASSPORTLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.POLICY_SERVER:
      return {
        Icon: light ? <SERVERLIGHT /> : <SERVER />,
        Logo: (
          <Text letterSpacing={1.5} fontWeight={200} fontSize={14} color={'light.lightBlack2'}>
            Signing Server
          </Text>
        ),
        type: SignerStorage.HOT,
      };
    case SignerType.TAPSIGNER:
      return {
        Icon: light ? <TAPSIGNERICONLIGHT /> : <TAPSIGNERICON />,
        Logo: <TAPSIGNERLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.TREZOR:
      return {
        Icon: light ? <TREZORICONLIGHT /> : <TREZORICON />,
        Logo: <TREZORLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.SEED_WORDS:
      return {
        Icon: <SEEDWORDSICON />,
        Logo: (
          <Text letterSpacing={1.5} fontWeight={200} fontSize={14} color={'light.lightBlack2'}>
            Seed Words Based
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
