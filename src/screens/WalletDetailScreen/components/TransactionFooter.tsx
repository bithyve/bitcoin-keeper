import { Platform, StyleSheet } from 'react-native';
import React from 'react';
import { Box } from 'native-base';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Recieve from 'src/assets/images/receive.svg';
import Send from 'src/assets/images/send.svg';
import IconSettings from 'src/assets/images/icon_settings.svg';
import BuyBitcoin from 'src/assets/images/icon_buy.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomMenuItem from '../BottomMenuItem';
import { allowedRecieveTypes, allowedSendTypes } from '../WalletDetails';

function TransactionFooter({ currentWallet, onPressBuyBitcoin }) {
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();
  return (
    <Box
      style={[styles.footerContainer, { marginBottom: bottom }]}
      borderColor="light.primaryBackground"
    >
      <Box style={styles.border} borderColor="light.GreyText" />
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
              navigation.dispatch(CommonActions.navigate('Receive', { wallet: currentWallet }))
            }
            icon={<Recieve />}
            title="Receive"
          />
        )}
        {allowedRecieveTypes.includes(currentWallet.type) && (
          <BottomMenuItem onPress={onPressBuyBitcoin} icon={<BuyBitcoin />} title="Buy Bitcoin" />
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
