import { CommonActions } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, ActivityIndicator, Keyboard, Pressable, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import KeeperTextInput from 'src/components/KeeperTextInput';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { wp } from 'src/constants/responsive';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppSelector } from 'src/store/hooks';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Checked from 'src/assets/images/tick_icon.svg';
import { createSwapTnx, getSwapQuote, loadCoinDetails } from 'src/store/sagaActions/swap';
import BtcAcquireIcon from 'src/assets/images/bitcoin-acquire-icon.svg';
import UsdtWalletLogo from 'src/assets/images/usdt-wallet-logo.svg';
import Colors from 'src/theme/Colors';
import { useUSDTWallets } from 'src/hooks/useUSDTWallets';
import useVault from 'src/hooks/useVault';
import useWallets from 'src/hooks/useWallets';
import KeeperModal from 'src/components/KeeperModal';
import BuyBtcModalContent from '../BuyBtcModalContent';
import { EntityKind } from 'src/services/wallets/enums';
import { SwapHistory } from './SwapHistory';

export const CoinLogo = ({ code, isLarge = true }) => {
  const isBtc = code === 'BTC';

  const largeStyle = { width: wp(20), height: wp(20) };
  const smallStyle = { width: wp(15), height: wp(15) };

  return (
    <Box
      style={{
        backgroundColor: isBtc ? Colors.BrightOrange : Colors.DesaturatedTeal,
        width: isLarge ? wp(25) : wp(20),
        aspectRatio: 1,
        borderRadius: wp(20),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isBtc ? (
        <BtcAcquireIcon {...(isLarge ? largeStyle : smallStyle)} />
      ) : (
        <UsdtWalletLogo {...(isLarge ? largeStyle : smallStyle)} />
      )}
    </Box>
  );
};

export const Swaps = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const { coinDetails } = useAppSelector((state) => state.swap);
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const [fromValue, setFromValue] = useState<any>(0.0);
  const [toValue, setToValue] = useState<any>(0.0);
  const [loading, setLoading] = useState(false);
  const [isFixedRate, setIsFixedRate] = useState(false);
  const [coinFrom, setCoinFrom] = useState(null);
  const [walletFrom, setWalletFrom] = useState(null);
  const [coinTo, setCoinTo] = useState(null);
  const [walletTo, setWalletTo] = useState(null);
  const rateIdRef = useRef(null);
  const [inputError, setInputError] = useState(null);

  const { wallets } = useWallets({ getAll: true });
  const { allVaults } = useVault({
    includeArchived: false,
    getFirst: true,
    getHiddenWallets: false,
  });
  const { usdtWallets } = useUSDTWallets();
  const btcWallets = [...wallets, ...allVaults];
  const [showWalletSelection, setShowWalletSelection] = useState(false);
  const walletModeRef = useRef(null);

  useEffect(() => {
    if (!coinDetails) {
      setLoading(true);
      dispatch(
        loadCoinDetails(({ status, error }) => {
          setLoading(false);
          if (!status) {
            navigation.goBack();
            showToast(error, <ToastErrorIcon />);
          }
        })
      );
    }
  }, []);

  useEffect(() => {
    if (coinDetails && !coinFrom && !coinTo) {
      setCoinFrom(coinDetails.btc);
      setCoinTo(coinDetails.usdt);
    }
  }, [coinDetails]);

  useEffect(() => {
    getSwapAmount();
  }, [isFixedRate, coinTo]);

  const getSwapAmount = async () => {
    if (fromValue) {
      setLoading(true);
      dispatch(
        getSwapQuote({
          coinFrom,
          coinTo,
          amount: fromValue,
          float: !isFixedRate,
          callback: ({ status, amount, rateId, error }) => {
            setLoading(false);
            if (status) {
              setToValue(amount);
              rateIdRef.current = rateId;
            } else {
              showToast(error, <ToastErrorIcon />);
            }
          },
        })
      );
    }
  };

  const createTnx = async () => {
    if (!walletFrom || !walletTo) {
      showToast('Please select wallets before proceeding', <ToastErrorIcon />);
      return;
    }
    setLoading(true);
    dispatch(
      createSwapTnx({
        float: !isFixedRate,
        coinFrom,
        coinTo,
        depositAmount: fromValue,
        withdrawal:
          walletTo.entityKind === EntityKind.USDT_WALLET
            ? walletTo.specs.address
            : walletTo.specs.receivingAddress,
        refund:
          walletFrom.entityKind === EntityKind.USDT_WALLET
            ? walletFrom.specs.address
            : walletFrom.specs.receivingAddress,
        rateId: rateIdRef.current,
        callback: ({ status, tnx, error }) => {
          setLoading(false);
          if (status)
            navigation.dispatch(
              CommonActions.navigate('SwapDetails', { data: tnx, wallet: walletFrom })
            );
          else {
            showToast(error, <ToastErrorIcon />);
          }
        },
      })
    );
  };

  const createWalletSelection = (mode) => {
    if (mode === 'from') {
      if (coinFrom.code === 'BTC') return btcWallets;
      else return usdtWallets;
    } else {
      if (coinTo.code === 'BTC') return btcWallets;
      else return usdtWallets;
    }
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={'Swap'} />
      {!coinTo && !coinFrom ? (
        <ActivityIndicator style={{ height: '70%' }} size="large" />
      ) : (
        <ScrollView>
          <Box>
            <Text>
              <CoinLogo code={coinFrom.code} />
              From {coinFrom.code}
            </Text>

            <KeeperTextInput
              placeholder={'0.00'}
              value={fromValue}
              onChangeText={(value) => {
                const sanitized = value.replace(/[^0-9.]/g, '');
                setFromValue(sanitized);
              }}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              isError={inputError}
              onBlur={() => {
                setInputError(false);
                if (fromValue < coinFrom.min_amount || fromValue > coinFrom.max_amount) {
                  setInputError(
                    'Amount should be between ' +
                      coinFrom.min_amount +
                      ' and ' +
                      coinFrom.max_amount
                  );
                  return;
                }
                if (fromValue) getSwapAmount();
              }}
            />
            {inputError && <Text color={Colors.AlertRedDark}>{inputError}</Text>}

            <Pressable
              style={{ backgroundColor: Colors.headerWhite, padding: 5 }}
              onPress={() => {
                walletModeRef.current = 'from';
                setShowWalletSelection(true);
              }}
            >
              <Text>{`Selected Wallet: ${
                walletFrom?.presentationData?.name ?? 'Not Selected'
              }`}</Text>
            </Pressable>
          </Box>
          <Box my={3}>
            <Buttons
              primaryText="Switch 🔃"
              fullWidth
              primaryCallback={() => {
                // switch coins
                const fromTmp = coinFrom;
                setCoinFrom(coinTo);
                setCoinTo(fromTmp);
                // unselect wallets
                setWalletFrom(null);
                setWalletTo(null);
              }}
            />
          </Box>
          <Box>
            <Text>
              <CoinLogo code={coinTo.code} />
              To {coinTo.code}
            </Text>
            <KeeperTextInput
              placeholder={'0.00'}
              value={toValue}
              onChangeText={(value) => setToValue(value)}
              editable={false}
            />
            <Pressable
              style={{ backgroundColor: Colors.headerWhite, padding: 5 }}
              onPress={() => {
                walletModeRef.current = 'to';
                setShowWalletSelection(true);
              }}
            >
              <Text>{`Selected Wallet: ${
                walletTo?.presentationData?.name ?? 'Not Selected'
              }`}</Text>
            </Pressable>
          </Box>

          <Pressable onPress={() => setIsFixedRate(!isFixedRate)}>
            <Box flexDir={'row'} marginY={4} alignItems={'center'}>
              {isFixedRate ? (
                <Checked width={wp(19)} height={wp(19)} />
              ) : (
                <Box style={styles.circle} borderColor={`${colorMode}.brownBackground`} />
              )}{' '}
              <Text>Fixed Rate</Text>
            </Box>
          </Pressable>

          <Buttons
            primaryText="Swap Funds"
            primaryCallback={createTnx}
            primaryLoading={loading}
            fullWidth
            primaryDisable={toValue <= 0}
          />
          <Box mt={5}>
            <SwapHistory navigation={navigation} />
          </Box>
        </ScrollView>
      )}

      <KeeperModal
        visible={showWalletSelection}
        close={() => setShowWalletSelection(false)}
        title={walletModeRef.current === 'from' ? 'Select From Wallet' : 'Select to Wallet'}
        subTitle={'Select Wallet subtitle'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <BuyBtcModalContent
            allWallets={createWalletSelection(walletModeRef.current)}
            setSelectedWallet={walletModeRef.current === 'from' ? setWalletFrom : setWalletTo}
            selectedWallet={walletModeRef.current === 'from' ? walletFrom : walletTo}
          />
        )}
        buttonText={'COnfirm'}
        buttonCallback={() => {
          if (walletModeRef.current === 'from' ? !walletFrom : !walletTo) return;
          setShowWalletSelection(false);
        }}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(18),
    borderWidth: 1,
  },
});
