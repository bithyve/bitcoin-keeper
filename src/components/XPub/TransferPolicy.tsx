import React, { useContext, useEffect, useState } from 'react';
import { Box, HStack, Input, useColorMode } from 'native-base';

import BitcoinInput from 'src/assets/images/btc_input.svg';

import { LocalizationContext } from 'src/context/Localization/LocContext';
import { wp } from 'src/constants/responsive';
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

  const onPressNumber = (digit) => {
    let temp = policyText;
    if (digit !== 'x') {
      temp += digit;
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
  return (
    <Box backgroundColor={`${colorMode}.modalWhiteBackground`} width={wp(300)}>
      <Box flexDirection="row" justifyContent="center" alignItems="center">
        <Box
          marginX="5%"
          flexDirection="row"
          width="100%"
          justifyContent="center"
          alignItems="center"
          borderRadius={10}
          backgroundColor={`${colorMode}.seashellWhite`}
          padding={3}
          height={50}
        >
          <Box pl={10}>
            {getCurrencyIcon(BitcoinInput, colorMode === 'light' ? 'dark' : 'light')}
          </Box>
          <Box ml={4} width={0.5} backgroundColor="#BDB7B1" opacity={0.3} height={5} />
          <Input
            value={policyText}
            onChangeText={(value) => {
              if (!isNaN(Number(value))) {
                setPolicyText(
                  value
                    .split('.')
                    .map((el, i) => (i ? el.split('').join('') : el))
                    .join('.')
                );
              }
            }}
            fontSize={15}
            color={`${colorMode}.greenText`}
            letterSpacing={3}
            keyboardType="numeric"
            placeholder="Enter Amount"
            width={getSatUnit() ? '75%' : '94%'}
            marginRight={getSatUnit() ? 20 : 25}
            placeholderTextColor={`${colorMode}.SlateGreen`}
            variant="unstyled"
          />
        </Box>
        <HStack style={styles.inputInnerStyle}>
          <Text semiBold color={`${colorMode}.divider`}>
            {getSatUnit() && `| ${getSatUnit()}`}
          </Text>
        </HStack>
      </Box>
      <Box py={25}>
        <Text fontSize={13} color={`${colorMode}.secondaryText`} letterSpacing={0.65}>
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
  inputInnerStyle: {
    position: 'absolute',
    right: wp(20),
    gap: 2,
    alignItems: 'center',
    marginLeft: -20,
  },
});

export default TransferPolicy;
