import React, { useContext, useEffect, useState } from 'react';
import { Box, Input, useColorMode } from 'native-base';

import BTC from 'src/assets/images/btc.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { hp, wp } from 'src/constants/responsive';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import Text from 'src/components/KeeperText';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import { updateWalletProperty } from 'src/store/sagaActions/wallets';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { v4 as uuidv4 } from 'uuid';
import Buttons from 'src/components/Buttons';
import KeyPadView from '../AppNumPad/KeyPadView';
import ActivityIndicatorView from '../AppActivityIndicator/ActivityIndicatorView';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import useExchangeRates from 'src/hooks/useExchangeRates';
import { SATOSHIS_IN_BTC } from 'src/constants/Bitcoin';
import { Satoshis } from 'src/models/types/UnitAliases';
import useBalance from 'src/hooks/useBalance';
import { numberWithCommas } from 'src/utils/utilities';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Colors from 'src/theme/Colors';
import { StyleSheet } from 'react-native';

function TransferPolicy({
  wallet,
  close,
  secondaryBtnPress,
}: {
  wallet: Wallet;
  close: () => void;
  secondaryBtnPress: () => void;
}) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletTranslation, settings } = translations;
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const [policyText, setPolicyText] = useState(null);
  const dispatch = useDispatch();
  const { getCurrencyIcon, getSatUnit } = useBalance();
  const isBitcoin = currentCurrency === CurrencyKind.BITCOIN;
  const storedPolicy = wallet?.transferPolicy?.threshold?.toString();
  const [isInputFocused, setIsInputFocused] = useState(false);

  const onPressNumber = (digit) => {
    let temp = policyText;
    if (digit !== 'x') {
      temp == null ? (temp = digit) : (temp += digit);
      setPolicyText(temp);
    }
  };

  function convertFiatToSats(fiatAmount: number) {
    return exchangeRates && exchangeRates[currencyCode]
      ? (fiatAmount / exchangeRates[currencyCode].last) * SATOSHIS_IN_BTC
      : 0;
  }
  function convertSatsToFiat(amount: Satoshis) {
    return exchangeRates && exchangeRates[currencyCode]
      ? (amount / SATOSHIS_IN_BTC) * exchangeRates[currencyCode].last
      : 0;
  }

  useEffect(() => {
    if (storedPolicy == '0' && !policyText) return;
    if (!policyText) {
      !isBitcoin
        ? setPolicyText(convertSatsToFiat(parseFloat(storedPolicy)).toFixed(0).toString())
        : setPolicyText(storedPolicy);
    } else if (isBitcoin)
      setPolicyText(convertFiatToSats(parseFloat(policyText)).toFixed(0).toString());
    else setPolicyText(convertSatsToFiat(parseFloat(policyText)).toFixed(0).toString());
  }, [currentCurrency]);

  useEffect(() => {
    if (relayWalletError) {
      showToast(common.somethingWrong);
      dispatch(resetRealyWalletState());
    }
    if (relayWalletUpdate) {
      close();
      showToast(walletTranslation.TransPolicyChange, <TickIcon />);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, realyWalletErrorMessage]);

  const onDeletePressed = () => {
    if (policyText) {
      setPolicyText(policyText.slice(0, -1));
    }
  };
  const presshandler = () => {
    if (Number(policyText) > 0) {
      wallet.transferPolicy.threshold = isBitcoin
        ? Number(policyText)
        : Number(convertFiatToSats(parseFloat(policyText)).toFixed(0).toString());
      dispatch(
        updateWalletProperty({
          walletId: wallet.id,
          key: 'transferPolicy',
          value: {
            id: uuidv4(),
            threshold: isBitcoin
              ? Number(policyText)
              : Number(convertFiatToSats(parseFloat(policyText)).toFixed(0).toString()),
          },
        })
      );
    } else {
      showToast(walletTranslation.transPolicyCantZero);
    }
  };

  const inputContainerStyles = {
    shadowColor: colorMode === 'light' ? Colors.Black : Colors.headerWhite,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isInputFocused ? 0.1 : 0,
    shadowRadius: 3.84,
    elevation: isInputFocused ? 5 : 0,
  };
  return (
    <Box backgroundColor={`${colorMode}.modalWhiteBackground`} style={styles.transferContainer}>
      <Box style={styles.transferSubContainer}>
        <Box
          backgroundColor={`${colorMode}.seashellWhite`}
          onTouchStart={() => setIsInputFocused(true)}
          style={[inputContainerStyles, styles.inputContainer]}
          borderColor={`${colorMode}.dullGreyBorder`}
        >
          <Box ml={25}>{getCurrencyIcon(BTC, 'slateGreen')}</Box>
          <Box ml={3} style={styles.separator} backgroundColor={`${colorMode}.dullGreyBorder`} />
          <Box width={getSatUnit() ? '90%' : '105%'}>
            <TouchableOpacity>
              <Input
                style={[
                  styles.inputField,
                  {
                    letterSpacing: policyText ? 3 : 0,
                    fontWeight: policyText ? '500' : '400',
                    fontSize: policyText ? 15 : 12,
                  },
                ]}
                numberOfLines={null}
                editable={false}
                variant="unstyled"
                color={policyText ? `${colorMode}.greenText` : `${colorMode}.placeHolderTextColor`}
                _input={
                  colorMode === 'dark' && {
                    selectionColor: Colors.bodyText,
                    cursorColor: Colors.bodyText,
                  }
                }
              >
                {policyText ? `${numberWithCommas(policyText)}` : 'Enter Amount'}
              </Input>
            </TouchableOpacity>
          </Box>
          <Text medium fontSize={12} color={`${colorMode}.SlateGreen`}>
            {getSatUnit() && ` ${getSatUnit()}`}
          </Text>
        </Box>
      </Box>
      <Box style={styles.descContainer}>
        <Text style={styles.desc} color={`${colorMode}.secondaryText`}>
          {walletTranslation.editTransPolicyInfo}
        </Text>
      </Box>
      <Buttons
        primaryCallback={presshandler}
        primaryText={settings.SaveChanges}
        secondaryCallback={secondaryBtnPress}
        secondaryText={common.cancel}
        paddingHorizontal={wp(15)}
        primaryDisable={relayWalletUpdateLoading || relayWalletUpdate}
      />
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={colorMode === 'light' ? '#041513' : '#FFF'}
        ClearIcon={colorMode === 'dark' ? <DeleteIcon /> : <DeleteDarkIcon />}
      />
      {relayWalletUpdateLoading && <ActivityIndicatorView visible={relayWalletUpdateLoading} />}
    </Box>
  );
}

const styles = StyleSheet.create({
  transferContainer: {
    width: wp(300),
  },
  transferSubContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    padding: 3,
    height: hp(50),
    borderRadius: 10,
    marginHorizontal: '5%',
    paddingLeft: 25,
    paddingRight: 50,
  },
  inputField: {
    fontSize: 15,
    fontWeight: '500',
  },
  limitText: {
    marginRight: 10,
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  descContainer: {
    paddingVertical: 25,
  },
  desc: {
    fontSize: 14,
  },
  separator: {
    width: 2,
    height: 20,
    marginRight: 2,
  },
});

export default TransferPolicy;
