import React, { useEffect } from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { numberWithCommas } from 'src/utils/utilities';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import EquivalentGreen from 'src/assets/images/equivalent-green.svg';
import EquivalentGrey from 'src/assets/images/equivalent-grey.svg';
import SwitchArrowsWhite from 'src/assets/images/switch-arrows-white.svg';
import SwitchArrowGreen from 'src/assets/images/switch-arrows-green.svg';
import useBalance from 'src/hooks/useBalance';

const AmountDetailsInput = ({
  amount,
  currentAmount,
  setCurrentAmount,
  equivalentAmount,
  setEquivalentAmount,
  satsEnabled,
  handleSendMax = null,
  specificBitcoinAmount = null,
  currencyCode,
  localCurrencyKind,
  setLocalCurrencyKind,
}) => {
  const { colorMode } = useColorMode();
  const { getCustomConvertedBalance } = useBalance();
  const isDarkMode = colorMode === 'dark';

  const convertAmount = (value, fromKind, toKind) => {
    return getCustomConvertedBalance(value, fromKind, toKind);
  };

  useEffect(() => {
    setCurrentAmount(amount);
  }, [amount]);

  useEffect(() => {
    if (!currentAmount || currentAmount === '0') {
      setEquivalentAmount('0');
      return;
    }

    const newKind =
      localCurrencyKind === CurrencyKind.FIAT ? CurrencyKind.BITCOIN : CurrencyKind.FIAT;
    const convertedEquivalent = convertAmount(currentAmount, localCurrencyKind, newKind);
    setEquivalentAmount(convertedEquivalent);
  }, [currentAmount, localCurrencyKind, satsEnabled]);

  const getDisplayAmount = () => {
    if (!currentAmount || currentAmount === '0') return '0';
    if (currentAmount === '.') return '0.';

    try {
      const currentAmountStr = (
        specificBitcoinAmount && localCurrencyKind === CurrencyKind.BITCOIN
          ? specificBitcoinAmount
          : currentAmount
      ).toString();
      const maxDigits = 10;

      if (currentAmountStr.endsWith('.')) {
        return localCurrencyKind === CurrencyKind.FIAT
          ? numberWithCommas(currentAmountStr.slice(0, -1)) + '.'
          : currentAmountStr;
      }

      const [wholePart, decimalPart] = currentAmountStr.split('.');

      const formattedWholePart =
        localCurrencyKind === CurrencyKind.FIAT
          ? numberWithCommas(wholePart)
          : satsEnabled
          ? numberWithCommas(wholePart)
          : wholePart;

      let formattedAmount = decimalPart
        ? `${formattedWholePart}.${decimalPart}`
        : formattedWholePart;

      if (formattedAmount.replace(/[,\.]/g, '').length > maxDigits) {
        formattedAmount = formattedAmount.slice(0, maxDigits) + '...';
      }

      return formattedAmount;
    } catch (error) {
      console.log('Display formatting error:', error);
      return '0';
    }
  };

  const getEquivalentAmount = () => {
    if (!equivalentAmount || equivalentAmount === '0') return '0';

    try {
      let equivalent = parseFloat(equivalentAmount);
      if (localCurrencyKind === CurrencyKind.FIAT) {
        if (specificBitcoinAmount) {
          equivalent = specificBitcoinAmount;
        }
        if (satsEnabled) {
          return numberWithCommas(equivalent.toString());
        }
        return equivalent.toString();
      } else {
        return numberWithCommas(equivalent.toFixed(2));
      }
    } catch (error) {
      console.log('Equivalent amount error:', error);
      return '0';
    }
  };

  const handleSwitch = () => {
    const newCurrencyKind =
      localCurrencyKind === CurrencyKind.FIAT ? CurrencyKind.BITCOIN : CurrencyKind.FIAT;
    setLocalCurrencyKind(newCurrencyKind);
    if (!currentAmount || currentAmount === '0') {
      return;
    }

    const newEquivalentAmount = convertAmount(currentAmount, localCurrencyKind, newCurrencyKind);
    setEquivalentAmount(currentAmount);
    setCurrentAmount(newEquivalentAmount);
  };

  return (
    <Box style={styles.bottomContainer}>
      <Box style={styles.amountDetailsContainer}>
        <Box style={styles.amountDetailsWrapper}>
          <Box style={styles.amtDetailsTitleWrapper}>
            <Text style={styles.amountText} color={`${colorMode}.pitchBlackText`}>
              {getDisplayAmount()}
            </Text>
            <Text style={styles.amountText} color={`${colorMode}.greenText`}>
              {localCurrencyKind === CurrencyKind.FIAT
                ? currencyCode
                : satsEnabled
                ? 'SATS'
                : 'BTC'}
            </Text>
          </Box>

          <Box style={styles.equivalentAmtDetailsTitleWrapper}>
            {isDarkMode ? <EquivalentGrey /> : <EquivalentGreen />}
            <Text style={styles.equivalentAmountText} color={`${colorMode}.greenishGreyText`}>
              {localCurrencyKind === CurrencyKind.FIAT
                ? satsEnabled
                  ? 'SATS'
                  : 'BTC'
                : currencyCode}
            </Text>
            <Text style={styles.equivalentAmountText} color={`${colorMode}.greenishGreyText`}>
              {getEquivalentAmount()}
            </Text>
          </Box>
          {handleSendMax && (
            <Pressable
              onPress={handleSendMax}
              backgroundColor={`${colorMode}.brownBackground`}
              style={styles.sendMaxWrapper}
              testID="btn_sendMax"
            >
              <Text
                testID="text_sendmax"
                color={`${colorMode}.buttonText`}
                style={styles.sendMaxText}
              >
                Send Max
              </Text>
            </Pressable>
          )}
        </Box>
      </Box>
      <Pressable style={styles.switchButtonWrapper} onPress={handleSwitch}>
        <Box
          style={styles.switchButton}
          backgroundColor={`${colorMode}.secondaryBackground`}
          borderColor={`${colorMode}.dullGreyBorder`}
        >
          {isDarkMode ? <SwitchArrowsWhite /> : <SwitchArrowGreen />}
        </Box>
      </Pressable>
    </Box>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountDetailsContainer: {
    marginTop: hp(30),
    width: '100%',
    height: hp(120),
  },
  amountDetailsWrapper: {
    alignSelf: 'center',
    height: hp(120),
    width: '100%',
  },
  amtDetailsTitleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 11,
  },
  equivalentAmtDetailsTitleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: hp(10),
    gap: 5,
  },
  amountText: {
    textAlign: 'center',
    fontSize: 32,
    lineHeight: 38,
  },
  equivalentAmountText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  sendMaxWrapper: {
    width: wp(85),
    alignSelf: 'center',
    marginTop: hp(20),
    paddingHorizontal: hp(12),
    paddingVertical: hp(3),
    borderRadius: 5,
  },
  sendMaxText: {
    textAlign: 'center',
    fontSize: 11,
  },
  switchButtonWrapper: {
    position: 'absolute',
    left: '90%',
    top: '17%',
  },
  switchButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(34),
    height: hp(39),
    borderRadius: 7,
    borderWidth: 1,
  },
});

export default AmountDetailsInput;
