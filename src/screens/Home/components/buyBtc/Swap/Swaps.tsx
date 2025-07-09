import { CommonActions } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, ActivityIndicator, Keyboard, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import KeeperTextInput from 'src/components/KeeperTextInput';
import ScreenWrapper from 'src/components/ScreenWrapper';
import RemoteSvg from 'src/components/SVGComponents/RemoteSvg';
import WalletHeader from 'src/components/WalletHeader';
import { wp } from 'src/constants/responsive';
import useToastMessage from 'src/hooks/useToastMessage';
import Swap from 'src/services/backend/Swap';
import { useAppSelector } from 'src/store/hooks';
import { setCoinDetails } from 'src/store/reducers/swap';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Checked from 'src/assets/images/tick_icon.svg';

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

  const [rate, setRate] = useState(null);
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
    if (!coinDetails) getCoinsData();
    if (!rate) {
      getRequiredCoins();
    }
  }, []);

  useEffect(() => {
    getExchangeValue();
  }, [isFixedRate]);

  const getCoinsData = async () => {
    let coins = {
      btc: null,
      usdt: null,
    };
    const res = await Swap.getCoins();
    res.data.forEach((coin) => {
      if (coin.code === 'BTC') coins.btc = coin;
      else if (coin.code === 'USDT-TRC20') coins.usdt = coin;
    });
    dispatch(setCoinDetails(coins));
  };

  const getRequiredCoins = async () => {
    try {
      let res = await Swap.getCoinsInfo([COINS.btc.code, COINS.usdt.code]);
      const coinDetails = res.data.filter((item) => {
        // convert to find
        if (
          [COINS.btc.network].includes(item.network_from) &&
          [COINS.usdt.network].includes(item.network_to)
        )
          return true;
        return false;
      });
      setRate(coinDetails[0]);
    } catch (error) {
      console.log('🚀 ~ getCoins ~ error:', error);
    }
  };

  const getExchangeValue = async () => {
    if (!fromValue) return;
    rateIdRef.current = null;
    try {
      setLoading(true);
      const body = {
        from: coinDetails.btc.code,
        to: coinDetails.usdt.code,
        network_from: coinDetails.btc.network_code,
        network_to: coinDetails.usdt.network_code,
        amount: fromValue,
        float: false,
      };
      const quote = await Swap.getQuote(body);
      setToValue(parseFloat(quote.data.amount).toFixed(3));
      rateIdRef.current = quote.data.rate_id;
    } catch (error) {
      console.log('🚀 ~ getExchangeValue ~ error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTnx = async () => {
    try {
      setLoading(true);
      const body = {
        float: !isFixedRate,
        coin_from: coinDetails.btc.code,
        coin_to: coinDetails.usdt.code,
        network_from: coinDetails.btc.network_code,
        network_to: coinDetails.usdt.network_code,
        deposit_amount: fromValue,
        withdrawal: details.withdrawal,
        return: details.return, // btc sent from(spending wallet address)
        rate_id: rateIdRef.current, // only required for fixed rate tnx
      };
      console.log('🚀 ~ createTnx ~ body:', body);
      const tnx = await Swap.createTnx(body);
      navigation.dispatch(CommonActions.navigate('SwapDetails', tnx));
    } catch (error) {
      console.log('🚀 ~ createTnx ~ error:', error);
      showToast(error.message, <ToastErrorIcon />);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={'Swap'} />
      {!rate || !coinDetails ? (
        <ActivityIndicator style={{ height: '70%' }} size="large" />
      ) : (
        <Box flex={1}>
          <Box>
            <Text>
              <RemoteSvg url={coinDetails.btc.icon} height={wp(30)} width={wp(30)} useViewBox />
              {`From ${rate.from}`}
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
                if (fromValue) getExchangeValue();
              }}
            />
          </Box>
          <Box />
          <Box>
            <Text>
              <RemoteSvg url={coinDetails.usdt.icon} height={wp(30)} width={wp(30)} />
              {`To ${rate.to}`}
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
      <ActivityIndicatorView visible={loading} showLoader />
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
