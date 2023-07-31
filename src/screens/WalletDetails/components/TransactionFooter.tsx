import { Platform, StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { hp, windowHeight } from 'src/common/data/responsiveness/responsive';
import Recieve from 'src/assets/images/receive.svg';
import Send from 'src/assets/images/send.svg';
import IconSettings from 'src/assets/images/icon_settings.svg';
import BuyBitcoin from 'src/assets/images/icon_buy.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useFeatureMap from 'src/hooks/useFeatureMap';
import useToastMessage from 'src/hooks/useToastMessage';

import BottomMenuItem from '../BottomMenuItem';
import { allowedRecieveTypes, allowedSendTypes } from '..';


function TransactionFooter({ currentWallet, onPressBuyBitcoin, walletIndex }) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const featureMap = useFeatureMap({ walletIndex });
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();
  return (
    <Box
      style={[styles.footerContainer, { marginBottom: bottom }]}
      borderColor={`${colorMode}.primaryBackground`}
    >
      <Box style={styles.border} borderColor={`${colorMode}.GreyText`} />
      <Box style={styles.footerItemContainer}>
        {allowedSendTypes.includes(currentWallet.type) && (
          <BottomMenuItem
            onPress={() =>
              navigation.dispatch(CommonActions.navigate('Send', { sender: currentWallet }))
            }
            icon={<Send />}
            title="Send"
          />
        )}
        {allowedRecieveTypes.includes(currentWallet.type) && (
          <BottomMenuItem
            onPress={() =>
              featureMap.walletRecieve
                ? navigation.dispatch(CommonActions.navigate('Receive', { wallet: currentWallet }))
                : showToast('Please Upgrade', <ToastErrorIcon />)

            }
            icon={<Recieve />}
            title="Receive"
          />
        )}
        {allowedRecieveTypes.includes(currentWallet.type) && (
          <BottomMenuItem onPress={onPressBuyBitcoin} icon={<BuyBitcoin />} title="Buy" />
        )}
        <BottomMenuItem
          onPress={() =>
            navigation.dispatch(CommonActions.navigate('WalletSettings', { wallet: currentWallet }))
          }
          icon={<IconSettings />}
          title="Settings"
        />
      </Box>
    </Box>
  );
}

export default TransactionFooter;

const styles = StyleSheet.create({
  footerContainer: {
    bottom: Platform.OS === 'ios' ? 5 : 0,
    paddingHorizontal: 5,
    justifyContent: 'center',
  },
  border: {
    borderWidth: 0.5,
    borderRadius: 20,
    opacity: 0.2,
  },
  footerItemContainer: {
    flexDirection: 'row',
    paddingTop: windowHeight > 850 ? 15 : 5,
    marginBottom: windowHeight > 850 ? hp(10) : 0,
    justifyContent: 'space-evenly',
    marginHorizontal: 16,
  },
});
