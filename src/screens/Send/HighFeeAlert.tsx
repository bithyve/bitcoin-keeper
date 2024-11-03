import { Box, useColorMode } from 'native-base';
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { hp, windowWidth } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import FeerateStatement from '../FeeInsights/FeerateStatement';
import Colors from 'src/theme/Colors';

function HighFeeAlert({
  transactionPriority,
  txFeeInfo,
  amountToSend,
  showFeesInsightModal,
  OneDayHistoricalFee,
  isFeeHigh,
  isUsualFeeHigh,
  setTopText,
}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTransactions } = translations;

  const selectedFee = txFeeInfo[transactionPriority?.toLowerCase()]?.amount;
  const [bottomText, setBottomText] = useState('');

  useEffect(() => {
    const topText = isFeeHigh ? walletTransactions.highCustom : walletTransactions.highWait;
    const bottomText = isFeeHigh
      ? isUsualFeeHigh
        ? walletTransactions.highWait
        : walletTransactions.highUsual
      : walletTransactions.lowFee;

    setTopText(topText);
    setBottomText(bottomText);
  }, [isFeeHigh, isUsualFeeHigh, setTopText]);

  const renderFeeDetails = () => (
    <View style={styles.boxWrapper}>
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.highFeeDetailsContainer}>
        <Text style={styles.highFeeTitle}>{walletTransactions.networkFee}</Text>
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
        <Text style={styles.highFeeTitle}>{walletTransactions.amtBeingSent}</Text>
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

  const renderFeeStats = () => (
    <>
      <Text style={styles.statsTitle}>Fee Stats</Text>
      {OneDayHistoricalFee.length > 0 && (
        <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.feeStatementContainer}>
          <FeerateStatement
            showFeesInsightModal={showFeesInsightModal}
            feeInsightData={OneDayHistoricalFee}
          />
        </Box>
      )}
    </>
  );

  return (
    <>
      {isFeeHigh && isUsualFeeHigh ? (
        <>
          {renderFeeDetails()}
          {renderFeeStats()}
          <Box width={'70%'}>
            <Text style={styles.highFeeNote}>{bottomText}</Text>
          </Box>
        </>
      ) : isFeeHigh ? (
        <>
          {renderFeeDetails()}
          {renderFeeStats()}
          <Box width={'70%'}>
            <Text style={styles.highFeeNote}>{bottomText}</Text>
          </Box>
        </>
      ) : (
        isUsualFeeHigh && (
          <>
            <Box style={styles.marginBottom}>{renderFeeStats()}</Box>
            {renderFeeDetails()}
            <Box width={'70%'}>
              <Text style={styles.highFeeNote}>{bottomText}</Text>
            </Box>
          </>
        )
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
