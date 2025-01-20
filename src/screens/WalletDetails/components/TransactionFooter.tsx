import React from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import SendIcon from 'src/assets/images/send-diagonal-arrow-up.svg';
import SendIconWhite from 'src/assets/images/send-diagonal-arrow-up.svg';
import RecieveIcon from 'src/assets/images/send-diagonal-arrow-down.svg';
import RecieveIconWhite from 'src/assets/images/send-diagonal-arrow-down.svg';

import idx from 'idx';
import { allowedRecieveTypes, allowedSendTypes } from '../WalletDetails';
import { useColorMode } from 'native-base';
import FooterActions from 'src/components/FooterActions';

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

  if (isWatchOnly) footerItems.shift();
  return (
    <FooterActions
      items={footerItems}
      wrappedScreen={false}
      backgroundColor={`${colorMode}.thirdBackground`}
    />
  );
}

export default TransactionFooter;
