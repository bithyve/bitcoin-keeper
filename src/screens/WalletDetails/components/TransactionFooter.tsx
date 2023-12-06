import React from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Recieve from 'src/assets/images/receive.svg';
import Send from 'src/assets/images/send.svg';
import IconSettings from 'src/assets/images/icon_settings.svg';
import BuyBitcoin from 'src/assets/images/icon_buy.svg';
import { allowedRecieveTypes, allowedSendTypes } from '../WalletDetails';
import KeeperFooter from 'src/components/KeeperFooter';

function TransactionFooter({ currentWallet, onPressBuyBitcoin }) {
  const navigation = useNavigation();

  const footerItems = [
    {
      Icon: Send,
      text: 'Send',
      onPress: () => navigation.dispatch(CommonActions.navigate('Send', { sender: currentWallet })),
      hideItems: !allowedSendTypes.includes(currentWallet.type),
    },
    {
      Icon: Recieve,
      text: 'Receive',
      onPress: () =>
        navigation.dispatch(CommonActions.navigate('Receive', { wallet: currentWallet })),
      hideItems: !allowedRecieveTypes.includes(currentWallet.type),
    },
    {
      Icon: BuyBitcoin,
      text: 'Buy',
      onPress: onPressBuyBitcoin,
      hideItems: !allowedRecieveTypes.includes(currentWallet.type),
    },
    {
      Icon: IconSettings,
      text: 'Settings',
      onPress: () =>
        navigation.dispatch(CommonActions.navigate('WalletSettings', { wallet: currentWallet })),
    },
  ];

  return <KeeperFooter items={footerItems} wrappedScreen={false} />;
}

export default TransactionFooter;
