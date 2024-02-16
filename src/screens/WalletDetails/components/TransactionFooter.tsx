import React from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import SendIcon from 'src/assets/images/icon_sent_footer.svg';
import RecieveIcon from 'src/assets/images/icon_received_footer.svg';
import SettingIcon from 'src/assets/images/settings_footer.svg';

import KeeperFooter from 'src/components/KeeperFooter';
import { allowedRecieveTypes, allowedSendTypes } from '../WalletDetails';

function TransactionFooter({ currentWallet }) {
  const navigation = useNavigation();

  const footerItems = [
    {
      Icon: SendIcon,
      text: 'Send',
      onPress: () => navigation.dispatch(CommonActions.navigate('Send', { sender: currentWallet })),
      hideItems: !allowedSendTypes.includes(currentWallet.type),
    },
    {
      Icon: RecieveIcon,
      text: 'Receive',
      onPress: () =>
        navigation.dispatch(CommonActions.navigate('Receive', { wallet: currentWallet })),
      hideItems: !allowedRecieveTypes.includes(currentWallet.type),
    },
    {
      Icon: SettingIcon,
      text: 'Settings',
      onPress: () =>
        navigation.dispatch(CommonActions.navigate('WalletSettings', { wallet: currentWallet })),
    },
  ];

  return <KeeperFooter items={footerItems} wrappedScreen={false} />;
}

export default TransactionFooter;
