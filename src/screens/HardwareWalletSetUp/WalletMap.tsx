import COLDCARDICON from 'src/assets/images/coldcard_icon.svg';
import COLDCARDLOGO from 'src/assets/images/coldcard_logo.svg';
import JADEICON from 'src/assets/images/jade_icon.svg';
import JADELOGO from 'src/assets/images/jade_logo.svg';
import KEYSTONEICON from 'src/assets/images/keystone_icon.svg';
import KEYSTONELOGO from 'src/assets/images/keystone_logo.svg';
import LEDGERICON from 'src/assets/images/ledger_icon.svg';
import LEDGERLOGO from 'src/assets/images/ledger_logo.svg';
import PASSPORTICON from 'src/assets/images/passport_icon.svg';
import PASSPORTLOGO from 'src/assets/images/passport_logo.svg';
import React from 'react';
import { SignerType } from 'src/core/wallets/enums';
import TAPSIGNERICON from 'src/assets/images/tapsigner_icon.svg';
import TAPSIGNERLOGO from 'src/assets/images/tapsigner_logo.svg';
import TREZORICON from 'src/assets/images/trezor_icon.svg';
import TREZORLOGO from 'src/assets/images/trezor_logo.svg';
import APP from 'src/assets/images/app.svg';
import SERVER from 'src/assets/images/server.svg';

import { Text } from 'native-base';

export const WalletMap = (type: SignerType) => {
  switch (type) {
    case SignerType.COLDCARD:
      return {
        Icon: <COLDCARDICON />,
        Logo: <COLDCARDLOGO />,
      };
    case SignerType.JADE:
      return {
        Icon: <JADEICON />,
        Logo: <JADELOGO />,
      };
    case SignerType.KEEPER:
      return {
        Icon: null,
        Logo: null,
      };
    case SignerType.KEYSTONE:
      return {
        Icon: <KEYSTONEICON />,
        Logo: <KEYSTONELOGO />,
      };
    case SignerType.LEDGER:
      return {
        Icon: <LEDGERICON />,
        Logo: <LEDGERLOGO />,
      };
    case SignerType.MOBILE_KEY:
      return {
        Icon: <APP />,
        Logo: <Text
          letterSpacing={1.5}
          fontWeight={200}
          fontSize={14}
          color={'light.lightBlack2'}>
          Mobile Key
        </Text>,
      };
    case SignerType.PASSPORT:
      return {
        Icon: <PASSPORTICON />,
        Logo: <PASSPORTLOGO />,
      };
    case SignerType.POLICY_SERVER:
      return {
        Icon: <SERVER />,
        Logo: <Text
          letterSpacing={1.5}
          fontWeight={200}
          fontSize={14}
          color={'light.lightBlack2'}>
          Signing Server
        </Text>,
      };
    case SignerType.TAPSIGNER:
      return {
        Icon: <TAPSIGNERICON />,
        Logo: <TAPSIGNERLOGO />,
      };
    case SignerType.TREZOR:
      return {
        Icon: <TREZORICON />,
        Logo: <TREZORLOGO />,
      };
    default:
      return {
        Icon: null,
        Logo: null,
      };
  }
};
