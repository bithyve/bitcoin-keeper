import React from 'react';
import { Text } from 'native-base';

import { SignerType, SignerStorage } from 'src/core/wallets/enums';
import { getNfcSupport, getBluetoothSupport, getDisabled } from './SigningDeviceList';

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
import PASSPORTICON from 'src/assets/images/passport_icon.svg';
import PASSPORTLOGO from 'src/assets/images/passport_logo.svg';
import TAPSIGNERICON from 'src/assets/images/tapsigner_icon.svg';
import TAPSIGNERICONLIGHT from 'src/assets/icons/tapsigner_light.svg';
import TAPSIGNERLOGO from 'src/assets/images/tapsigner_logo.svg';
import TREZORICON from 'src/assets/images/trezor_icon.svg';
import TREZORICONLIGHT from 'src/assets/icons/trezor_light.svg';
import TREZORLOGO from 'src/assets/images/trezor_logo.svg';
import APP from 'src/assets/images/app.svg';
import SERVER from 'src/assets/images/server.svg';

export const WalletMap = (type: SignerType, light = false) => {

  switch (type) {
    case SignerType.COLDCARD:
      return {
        Icon: light ? <COLDCARDICONLIGHT /> : <COLDCARDICON />,
        Logo: <COLDCARDLOGO />,
        disable: getNfcSupport(),
        message: getNfcSupport() ? 'NFC is Not enabled in your device' : '',
        type: SignerStorage.COLD
      };
    case SignerType.JADE:
      return {
        Icon: <JADEICON />,
        Logo: <JADELOGO />,
        disable: false,
        message: '',
        type: SignerStorage.COLD
      };
    case SignerType.KEEPER:
      return {
        Icon: null,
        Logo: (
          <Text letterSpacing={1.5} fontWeight={200} fontSize={14} color={'light.lightBlack2'}>
            Another Keeper App
          </Text>
        ),
        disable: false,
        message: ''
      };
    case SignerType.KEYSTONE:
      return {
        Icon: <KEYSTONEICON />,
        Logo: <KEYSTONELOGO />,
        disable: false,
        message: '',
        type: SignerStorage.COLD
      };
    case SignerType.LEDGER:
      return {
        Icon: light ? <LEDGERICONLIGHT /> : <LEDGERICON />,
        Logo: <LEDGERLOGO />,
        disable: !getBluetoothSupport(),
        message: !getBluetoothSupport() ? 'BLE is Not enabled in your device' : '',
        type: SignerStorage.COLD
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
        disable: getDisabled().disabled,
        message: getDisabled().message,
        type: SignerStorage.HOT
      };
    case SignerType.PASSPORT:
      return {
        Icon: <PASSPORTICON />,
        Logo: <PASSPORTLOGO />,
        disable: false,
        message: '',
        type: SignerStorage.COLD
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
        disable: getDisabled().disabled,
        message: getDisabled().message,
        type: SignerStorage.HOT
      };
    case SignerType.TAPSIGNER:
      return {
        Icon: light ? <TAPSIGNERICONLIGHT /> : <TAPSIGNERICON />,
        Logo: <TAPSIGNERLOGO />,
        disable: getNfcSupport(),
        message: getNfcSupport() ? 'NFC is Not enabled in your device' : '',
        type: SignerStorage.COLD
      };
    case SignerType.TREZOR:
      return {
        Icon: light ? <TREZORICONLIGHT /> : <TREZORICON />,
        Logo: <TREZORLOGO />,
        disable: false,
        message: '',
        type: SignerStorage.COLD
      };
    case SignerType.SEED_WORDS:
      return {
        Icon: null,
        Logo: (
          <Text letterSpacing={1.5} fontWeight={200} fontSize={14} color={'light.lightBlack2'}>
            Seed Words Based
          </Text>
        ),
        disable: getDisabled().disabled,
        message: getDisabled().message,
        type: SignerStorage.WARM
      };
    default:
      return {
        Icon: null,
        Logo: null,
        disable: false,
        message: ''
      };
  }
};

