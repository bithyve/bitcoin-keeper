import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, Text, useColorMode } from 'native-base';
import BtcInput from 'src/assets/images/btc_input.svg';
import WalletIcon from 'src/assets/images/wallet_color.svg';
import { useAppSelector } from 'src/store/hooks';
import { SatsToBtc } from 'src/constants/Bitcoin';

export default function UtxoSummary({ utxoCount, totalAmount }) {
  const { colorMode } = useColorMode();
  const { satsEnabled } = useAppSelector((state) => state.settings);

  return (
    <Box style={styles.utxo}>
      <Box style={styles.icon}>
        <WalletIcon />
      </Box>
      <Box style={styles.utxoSummary}>
        <Box style={styles.utxoTextDirection}>
          <Text style={styles.noOfUtxo}>{utxoCount} </Text>
          <Text color={`${colorMode}.secondaryText`}>UTXOs Selected</Text>
        </Box>
        <Box style={styles.sats}>
          <BtcInput />
          <Text color={`${colorMode}.secondaryText`}>
            {' '}
            {satsEnabled ? totalAmount : SatsToBtc(totalAmount)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  utxo: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    marginTop: 20,
    marginLeft: 5,
  },
  icon: {
    marginRight: 10,
    marginTop: 5,
  },
  utxoSummary: {
    marginTop: 10,
  },
  noOfUtxo: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  utxoTextDirection: {
    flexDirection: 'row',
  },
  sats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
