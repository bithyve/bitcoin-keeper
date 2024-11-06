import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import IconSettings from 'src/assets/images/icon_settings.svg';
import Recieve from 'src/assets/images/receive.svg';
import Send from 'src/assets/images/send.svg';
import Text from 'src/components/KeeperText';
import Buy from 'src/assets/images/icon_buy.svg';
import { Vault } from 'src/services/wallets/interfaces/vault';

function VaultFooter({ vault, onPressBuy }: { vault: Vault; onPressBuy: () => void }) {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  return (
    <Box>
      <Box
        borderWidth={0.5}
        borderColor={`${colorMode}.GreyText`}
        borderRadius={20}
        opacity={0.2}
      />
      <Box flexDirection="row" justifyContent="space-between" marginX={10} marginTop={3}>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            navigation.dispatch(CommonActions.navigate('Send', { sender: vault }));
          }}
          testID="btn_vaultFooterSend"
        >
          <Send />
          <Text color={`${colorMode}.primaryText`} style={styles.footerText}>
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            navigation.dispatch(CommonActions.navigate('Receive', { wallet: vault }));
          }}
          testID="btn_vaultFooterReceive"
        >
          <Recieve />
          <Text color={`${colorMode}.primaryText`} style={styles.footerText}>
            Receive
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.IconText} onPress={onPressBuy} testID="btn_vaultFooterBuy">
          <Buy />
          <Text color={`${colorMode}.primaryText`} style={styles.footerText}>
            Buy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            navigation.dispatch(CommonActions.navigate('VaultSettings'));
          }}
          testID="btn_vaultFooterSettings"
        >
          <IconSettings />
          <Text color={`${colorMode}.primaryText`} style={styles.footerText}>
            Settings
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

export default VaultFooter;

const styles = StyleSheet.create({
  IconText: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  footerText: {
    fontSize: 12,
    letterSpacing: 0.84,
  },
});
