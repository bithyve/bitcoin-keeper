import { Box, useColorMode } from 'native-base';
import React, { useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { hp, windowWidth } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import Colors from 'src/theme/Colors';
import Text from 'src/components/KeeperText';

function HighFeeAlert({
  transactionPriority,
  txFeeInfo,
  amountToSend,
  isFeeHigh,
  isUsualFeeHigh,
  setTopText,
}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTransactions } = translations;

  const selectedFee = txFeeInfo[transactionPriority?.toLowerCase()]?.amount;

  useEffect(() => {
    const topText = isFeeHigh ? walletTransactions.highCustom : walletTransactions.highWait;

    setTopText(topText);
  }, [isFeeHigh, isUsualFeeHigh, setTopText]);

  const renderFeeDetails = () => (
    <View style={styles.boxWrapper}>
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.highFeeDetailsContainer}>
        <Text color={`${colorMode}.primaryText`} style={styles.highFeeTitle}>
          {walletTransactions.networkFee}
        </Text>
        <CurrencyInfo
          amount={selectedFee}
          hideAmounts={false}
          fontSize={16}
          bold
          color={colorMode === 'light' ? Colors.RichBlack : Colors.White}
          variation={colorMode === 'light' ? 'dark' : 'light'}
        />
      </Box>
      <View style={styles.divider} />
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.highFeeDetailsContainer}>
        <Text color={`${colorMode}.primaryText`} style={styles.highFeeTitle}>
          {walletTransactions.amtBeingSent}
        </Text>
        <CurrencyInfo
          amount={amountToSend}
          hideAmounts={false}
          fontSize={16}
          bold
          color={colorMode === 'light' ? Colors.RichBlack : Colors.White}
          variation={colorMode === 'light' ? 'dark' : 'light'}
        />
      </Box>
    </View>
  );

  return (
    <>
      {isFeeHigh && isUsualFeeHigh ? (
        <>{renderFeeDetails()}</>
      ) : isFeeHigh ? (
        <>{renderFeeDetails()}</>
      ) : (
        isUsualFeeHigh && <>{renderFeeDetails()}</>
      )}
    </>
  );
}

export default HighFeeAlert;

const styles = StyleSheet.create({
  highFeeTitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  statsTitle: {
    fontSize: 12,
    letterSpacing: 0.55,
    marginLeft: 5,
  },
  boxWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
    width: '100%',
  },
  highFeeDetailsContainer: {
    padding: 10,
    flex: 1,
    borderRadius: 10,
  },
  feeStatementContainer: {
    width: windowWidth * 0.8,
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  highFeeNote: {
    fontSize: 13,
    letterSpacing: 0.13,
  },
  divider: {
    width: 5,
    height: '100%',
  },
  marginBottom: {
    marginBottom: hp(20),
  },
});
