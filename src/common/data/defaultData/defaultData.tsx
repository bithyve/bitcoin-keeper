import BlockChainHomeIcon from 'src/assets/images/blockchainHome.svg';
import SingleSigIcon from 'src/assets/images/single_sig.svg';
import BlueWalletIcon from 'src/assets/images/blue_wallet.svg';
import SecutityTip from 'src/assets/images/securityTip.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { Image } from 'react-native';
import { hp, wp } from '../responsiveness/responsive';
import React from 'react';
export interface WALLET {
  Icon: React.SFC<React.SVGProps<SVGSVGElement>>;
  type: string;
  name: string;
  description: string;
  isImported: boolean;
  balance: number;
}

export const defaultWallets: WALLET[] = [
  {
    Icon: SingleSigIcon,
    type: 'Single-sig',
    name: 'Maldives Funds',
    description: 'Beach and Sunshine baby!',
    isImported: false,
    balance: 0.000024,
  },
  {
    Icon: BlockChainHomeIcon,
    type: 'Blockchain.com Wallet',
    name: 'Investment Funds',
    description: 'Rainy day umbrella',
    isImported: true,
    balance: 0.000389,
  },
];

export const walletData = (item) => {
  const walletTitle = (item as Wallet)?.presentationData?.name;
  if (walletTitle === 'Full Import') {
    return {
      Icon: BlueWalletIcon,
      type: 'Blue Wallet',
      name: 'Imported Wallet',
      description: 'Daily Spends',
      balance: 0,
    };
  }
  if (walletTitle === 'Checking Wallet') {
    return {
      Icon: SingleSigIcon,
      type: 'Single-sig',
      name: item?.presentationData?.name,
      description: item?.presentationData?.description,
      balance: 0,
    };
  }
  return {
    Icon: item.Icon,
    type: item.type,
    name: item.name,
    description: item.description,
    balance: item.balance,
  };
};

export const securityTips = [
  {
    title: 'Share Feedback',
    subTitle: '(Beta app only)\nShake your device to send us a bug report or a feature request',
    assert: <Image
      source={require('src/assets/video/test-net.gif')}
      style={{
        width: wp(270),
        height: hp(200),
        alignSelf: 'center',
      }}
    />,
    message:
      'This feature is *only* for the beta app. The developers will get your message along with other information from the app.',
  },
  {
    title: 'Security Tip',
    subTitle: 'Check the send-to address on a signing device you are going to use to sign the transaction.',
    assert: <SecutityTip />,
    message:
      'This ensures that the signed transaction has the intended recipient and the address was not swapped',
  },
  {
    title: 'Security Tip',
    subTitle: 'Devices with Register Vault tag provide additional checks when you are sending funds from your Vault',
    assert: <SecutityTip />,
    message:
      'These provide additional security checks when you make an outgoing transaction',
  },
  {
    title: 'Security Tip',
    subTitle: 'You can get a receive address directly from a signing device and do not have to trust the Keeper app',
    assert: <SecutityTip />,
    message:
      'This will mean that the funds are received at the correct address',
  },
  {
    title: 'Security Tip',
    subTitle: 'Recreate the Vault on another coordinator software and check if the multisig has the same details',
    assert: <SecutityTip />,
    message:
      'This is a way to minimise the trust you have to have on Keeper',
  },
  {
    title: 'Security Tip',
    subTitle: 'Recreate the multisig on more coordinators. Receive a small amount and send a part of it. Check the balances are appropriately reflected across all the coordinators after each step.',
    assert: <SecutityTip />,
    message:
      'Testing out your setup before using it is always a good idea',
  }
]