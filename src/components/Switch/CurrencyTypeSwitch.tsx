import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Box } from 'native-base';

import LinearGradient from 'react-native-linear-gradient';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import IconDoller from 'src/assets/icons/Wallets/icon_dollar.svg';
import IconBitcoin from 'src/assets/icons/Wallets/icon_bitcoin.svg';
import IconDollerWhite from 'src/assets/icons/Wallets/icon_dollar_white.svg';
import IconBitcoinWhite from 'src/assets/icons/Wallets/icon_bitcoin_white.svg';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setCurrencyKind } from 'src/store/reducers/settings';
import CurrencyKind from 'src/common/data/enums/CurrencyKind';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(10),
    height: wp(10),
    width: wp(17),
  },
});

const CurrencyTypeSwitch = () => {
  const { currencyKind } = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  const changeType = () => {
    if (currencyKind == CurrencyKind.BITCOIN) {
      dispatch(setCurrencyKind(CurrencyKind.FIAT));
    } else {
      dispatch(setCurrencyKind(CurrencyKind.BITCOIN));
    }
  };
  const prefersBitcoin = useMemo(() => {
    if (currencyKind === CurrencyKind.BITCOIN) {
      return true;
    }
    return false;
  }, [currencyKind]);

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={() => changeType()}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
        colors={['#00836A', '#073E39']}
      >
        <Box
          borderRadius={10}
          justifyContent={'space-between'}
          flexDirection="row"
          alignItems={'center'}
        >
          <Box
            height={7}
            width={7}
            borderRadius={!prefersBitcoin ? 16 : 0}
            backgroundColor={!prefersBitcoin ? '#fcfcfc' : null}
            alignSelf={prefersBitcoin ? 'flex-end' : 'flex-start'}
            marginRight={prefersBitcoin ? 1 : 0}
            marginLeft={prefersBitcoin ? 0 : 1}
            justifyContent={'center'}
            alignItems={'center'}
          >
            {/* <FontAwesome
              name={'dollar'}
              size={16}
              color={prefersBitcoin ? 'lightgray' : '#00836A'}
            /> */}
            {prefersBitcoin ? <IconDollerWhite /> : <IconDoller />}
          </Box>
          <Box
            height={7}
            width={7}
            borderRadius={prefersBitcoin ? 16 : 0}
            backgroundColor={prefersBitcoin ? '#fcfcfc' : null}
            alignSelf={prefersBitcoin ? 'flex-end' : 'flex-start'}
            marginRight={prefersBitcoin ? 1 : 0}
            marginLeft={prefersBitcoin ? 0 : 1}
            justifyContent={'center'}
            alignItems={'center'}
          >
            {/* <FontAwesome
              name={'bitcoin'}
              size={16}
              color={prefersBitcoin ? '#00836A' : 'lightgray'}
            /> */}
            {prefersBitcoin ? <IconBitcoin /> : <IconBitcoinWhite />}
          </Box>
        </Box>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default CurrencyTypeSwitch;
