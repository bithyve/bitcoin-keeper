import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import { Box } from 'native-base';
import CurrencyKind from 'src/common/data/enums/CurrencyKind';
import IconBitcoin from 'src/assets/images/icon_bitcoin.svg';
import IconBitcoinWhite from 'src/assets/images/icon_bitcoin_white.svg';
import IconDoller from 'src/assets/images/icon_dollar.svg';
import IconDollerWhite from 'src/assets/images/icon_dollar_white.svg';
import LinearGradient from 'src/components/KeeperGradient';
import { setCurrencyKind } from 'src/store/reducers/settings';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(10),
    height: wp(10),
    width: wp(17),
  },
});

function CurrencyTypeSwitch() {
  const { currencyKind } = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  const changeType = () => {
    if (currencyKind === CurrencyKind.BITCOIN) {
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
    <TouchableOpacity activeOpacity={0.6} onPress={() => changeType()} testID='btn_currencyToggle'>
      <LinearGradient
        start={[0, 0]}
        end={[1, 0]}
        style={styles.container}
        colors={['light.gradientStart', 'light.gradientEnd']}
      >
        <Box
          borderRadius={10}
          justifyContent="space-between"
          flexDirection="row"
          alignItems="center"
        >
          <Box
            height={7}
            width={7}
            borderRadius={!prefersBitcoin ? 16 : 0}
            backgroundColor={!prefersBitcoin ? '#fcfcfc' : null}
            alignSelf={prefersBitcoin ? 'flex-end' : 'flex-start'}
            marginRight={prefersBitcoin ? 1 : 0}
            marginLeft={prefersBitcoin ? 0 : 1}
            justifyContent="center"
            alignItems="center"
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
            justifyContent="center"
            alignItems="center"
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
}

export default CurrencyTypeSwitch;
