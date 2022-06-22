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
import { SignerType } from 'src/core/wallets/interfaces/enum';
import TAPSIGNERICON from 'src/assets/images/tapsigner_icon.svg';
import TAPSIGNERLOGO from 'src/assets/images/tapsigner_logo.svg';
import TREZORICON from 'src/assets/images/trezor_icon.svg';
import TREZORLOGO from 'src/assets/images/trezor_logo.svg';

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
        Icon: null,
        Logo: null,
      };
    case SignerType.PASSPORT:
      return {
        Icon: <PASSPORTICON />,
        Logo: <PASSPORTLOGO />,
      };
    case SignerType.POLICY_SERVER:
      return {
        Icon: null,
        Logo: null,
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
