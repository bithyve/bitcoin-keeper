import React, { useContext, useEffect, useState } from 'react';
import { Text } from 'native-base';
import NFC from 'src/core/services/nfc';
import { manager } from 'src/core/services/ble';

import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import { SignerType, SignerStorage } from 'src/core/wallets/enums';
import { useAppSelector } from 'src/store/hooks';

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

const findKeyInServer = () => {
  const vaultSigners = useAppSelector((state) => state.vault.signers);
  return vaultSigners.find(element => element.storageType === SignerStorage.HOT || element.storageType === SignerStorage.WARM);
}
const getDisabled = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];

  // Keys Incase of level 1 we have level 1
  if (subscription.name.toLowerCase() === SubscriptionTier.PLEB) {
    return { disabled: true, message: 'Upgrade to use these keys' };
  }
  // Keys Incase of already added 
  if (findKeyInServer()) {
    return { disabled: true, message: 'Key already added to the Vault.' }
  }
  return { disabled: false, message: '' }
}

export const WalletMap = (type: SignerType, light = false) => {

  const [nfcSupported, setNfcSupported] = useState(false);
  const [bluetoothState, setBluetoothState] = useState(false);

  useEffect(() => {
    getNfcSupport();
    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
      }
    }, true);
    return () => subscription.remove();
  }, []);

  const getNfcSupport = async () => {
    const isSupported = await NFC.isNFCSupported();
    setNfcSupported(!isSupported);
  };

  switch (type) {
    case SignerType.COLDCARD:
      return {
        Icon: light ? <COLDCARDICONLIGHT /> : <COLDCARDICON />,
        Logo: <COLDCARDLOGO />,
        disable: nfcSupported,
        message: nfcSupported ? 'NFC is Not enabled in your device' : '',
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
        disable: !bluetoothState,
        message: !bluetoothState ? 'BLE is Not enabled in your device' : '',
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
        disable: nfcSupported,
        message: nfcSupported ? 'NFC is Not enabled in your device' : '',
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

