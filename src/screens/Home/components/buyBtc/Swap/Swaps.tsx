import { CommonActions } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, ActivityIndicator, Keyboard, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import KeeperTextInput from 'src/components/KeeperTextInput';
import ScreenWrapper from 'src/components/ScreenWrapper';
import RemoteSvg from 'src/components/SVGComponents/RemoteSvg';
import WalletHeader from 'src/components/WalletHeader';
import { wp } from 'src/constants/responsive';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppSelector } from 'src/store/hooks';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Checked from 'src/assets/images/tick_icon.svg';
import { createSwapTnx, getSwapQuote, loadCoinDetails } from 'src/store/sagaActions/swap';

const COINS = {
  btc: {
    code: 'BTC',
    network: 'BTC',
  },
  usdt: {
    code: 'USDT',
    network: 'TRC20',
  },
};

export const Swaps = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const { coinDetails } = useAppSelector((state) => state.swap);
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const [fromValue, setFromValue] = useState<any>(0.0);
  const [toValue, setToValue] = useState<any>(0.0);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({
    withdrawal: 'TSTZYCuhpSbgzfGnsTHczGW5AHALvY9Mkz',
    return: 'bc1qxygdygjrs2kzq2n0qtyrf2111pxxxxxxxwl0h', // btc sent from(spending wallet address)
  });
  const [isFixedRate, setIsFixedRate] = useState(false);
  const rateIdRef = useRef(null);

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
    getSwapAmount();
  }, [isFixedRate]);

  const getSwapAmount = async () => {
    if (fromValue) setLoading(true);
    dispatch(
      getSwapQuote({
        coinFrom: coinDetails.btc,
        coinTo: coinDetails.usdt,
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
  };

  const createTnx = async () => {
    setLoading(true);
    dispatch(
      createSwapTnx({
        float: !isFixedRate,
        coinFrom: coinDetails.btc,
        coinTo: coinDetails.usdt,
        depositAmount: fromValue,
        withdrawal: details.withdrawal,
        refund: details.return,
        rateId: rateIdRef.current,
        callback: ({ status, tnx, error }) => {
          setLoading(false);
          if (status) navigation.dispatch(CommonActions.navigate('SwapDetails', tnx));
          else {
            showToast(error, <ToastErrorIcon />);
          }
        },
      })
    );
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={'Swap'} />
      {!coinDetails ? (
        <ActivityIndicator style={{ height: '70%' }} size="large" />
      ) : (
        <Box flex={1}>
          <Box>
            <Text>
              <RemoteSvg url={coinDetails.btc.icon} height={wp(30)} width={wp(30)} useViewBox />
              From {COINS.btc.code}
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
              onBlur={() => {
                if (fromValue) getSwapAmount();
              }}
            />
          </Box>
          <Box />
          <Box>
            <Text>
              <RemoteSvg url={coinDetails.usdt.icon} height={wp(30)} width={wp(30)} />
              To {COINS.usdt.code}
            </Text>
            <KeeperTextInput
              placeholder={'0.00'}
              value={toValue}
              onChangeText={(value) => setToValue(value)}
              editable={false}
            />
          </Box>
          <Box paddingY={'4'}>
            <Text>{`Receive Address: ${details.withdrawal}`}</Text>
            <Text>{`Refund Address: ${details.return}`}</Text>
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
        </Box>
      )}
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
