import React from 'react';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { ScaledSheet } from 'react-native-size-matters';

// components
import { hp, wp } from 'src/constants/responsive';
import EditIcon from 'src/assets/images/edit.svg';
import BTCIcon from 'src/assets/images/btc_black.svg';
import BTCWhite from 'src/assets/images/btc_white.svg';
import IconWallet from 'src/assets/images/icon_wallet.svg';
import { SatsToBtc } from 'src/constants/Bitcoin';
import CurrencyInfo from '../HomeScreen/components/CurrencyInfo';

function WalletSendInfo({
  availableAmt = '',
  walletName = '',
  isEditable = false,
  isSats = false,
  currencyIcon = BTCIcon,
  selectedUTXOs = [],
}) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.seashellWhite`}>
      <Box flexDirection="row">
        <TouchableOpacity style={styles.buttonBackground}>
          <IconWallet />
        </TouchableOpacity>
        <Box
          style={{
            marginLeft: wp(10),
          }}
        >
          <Text color={`${colorMode}.primaryText`} numberOfLines={1} style={styles.walletNameText}>
            {walletName}
          </Text>
          {selectedUTXOs.length ? (
            <Text fontSize={12} numberOfLines={1} color={`${colorMode}.primaryText`}>
              Sending from selected UTXOs of &nbsp;
              {colorMode === 'light' ? <BTCIcon /> : <BTCWhite />}
              &nbsp;
              <Text bold fontSize={14}>
                {SatsToBtc(selectedUTXOs.reduce((a, c) => a + c.value, 0))} {isSats && 'sats'}
              </Text>
            </Text>
          ) : (
            <Box style={styles.balanceWrapper}>
              <Text fontSize={12} numberOfLines={1}>
                Available to spend&nbsp;
              </Text>
              <CurrencyInfo
                hideAmounts={false}
                amount={availableAmt}
                fontSize={14}
                color={`${colorMode}.primaryText`}
                variation={colorMode === 'light' ? 'dark' : 'light'}
              />
            </Box>
          )}
        </Box>
      </Box>
      {isEditable && (
        <TouchableOpacity
          style={{
            marginRight: wp(5),
          }}
        >
          {/* { Do not have right assert in xd} */}
          <EditIcon />
        </TouchableOpacity>
      )}
    </Box>
  );
}
const styles = ScaledSheet.create({
  buttonBackground: {
    backgroundColor: '#FAC48B',
    width: hp(45),
    height: hp(45),
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp(10),
  },
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '97%',
    height: hp(70),
    borderRadius: 10,
  },
  walletNameText: {
    marginTop: 3,
    fontSize: 14,
    letterSpacing: 1.12,
    width: wp(100),
  },
  balanceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
export default WalletSendInfo;
