import React from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import SendIcon from 'src/assets/images/send.svg';
import SendIconWhite from 'src/assets/images/send-white.svg';
import RecieveIcon from 'src/assets/images/receive.svg';
import RecieveIconWhite from 'src/assets/images/receive-white.svg';

import KeeperFooter from 'src/components/KeeperFooter';
import idx from 'idx';
import { allowedRecieveTypes, allowedSendTypes } from '../WalletDetails';
import { useColorMode } from 'native-base';

function TransactionFooter({ currentWallet }) {
  const navigation = useNavigation();
  const isWatchOnly = !idx(currentWallet, (_) => _.specs.xpriv);
  const { colorMode } = useColorMode();

  const footerItems = [
    {
      Icon: colorMode === 'light' ? SendIcon : SendIconWhite,
      text: 'Send',
      onPress: () => navigation.dispatch(CommonActions.navigate('Send', { sender: currentWallet })),
      hideItems: !allowedSendTypes.includes(currentWallet.type),
    },
    {
      Icon: colorMode === 'light' ? RecieveIcon : RecieveIconWhite,
      text: 'Receive',
      onPress: () =>
        navigation.dispatch(CommonActions.navigate('Receive', { wallet: currentWallet })),
      hideItems: !allowedRecieveTypes.includes(currentWallet.type),
    },
  ];

  if (isWatchOnly) footerItems.shift(); // disabling send flow for watch-only wallets
  return <KeeperFooter items={footerItems} wrappedScreen={false} />;
}

export default TransactionFooter;
