import React, { useContext } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import SendIcon from 'src/assets/images/send-diagonal-arrow-up.svg';
import SendIconWhite from 'src/assets/images/send-diagonal-arrow-up.svg';
import RecieveIcon from 'src/assets/images/send-diagonal-arrow-down.svg';
import RecieveIconWhite from 'src/assets/images/send-diagonal-arrow-down.svg';

import idx from 'idx';
import { useColorMode } from 'native-base';
import FooterActions from 'src/components/FooterActions';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function TransactionFooter({ currentWallet }) {
  const navigation = useNavigation();
  const isWatchOnly = !idx(currentWallet, (_) => _.specs.xpriv);
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const footerItems = [
    {
      Icon: colorMode === 'light' ? SendIcon : SendIconWhite,
      text: common.send,
      onPress: () => navigation.dispatch(CommonActions.navigate('Send', { sender: currentWallet })),
    },
    {
      Icon: colorMode === 'light' ? RecieveIcon : RecieveIconWhite,
      text: common.receive,
      onPress: () =>
        navigation.dispatch(CommonActions.navigate('Receive', { wallet: currentWallet })),
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
