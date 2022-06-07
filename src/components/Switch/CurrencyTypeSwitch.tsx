import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Box } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

import IconDoller from 'src/assets/icons/Wallets/icon_dollar.svg';
import IconBitcoin from 'src/assets/icons/Wallets/icon_bitcoin.svg';

// import CurrencyKind from '../../common/data/enums/CurrencyKind';
// import { currencyKindSet } from '../../store/actions/preferences';
// import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind';
// import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState';
// import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode';
// import { useDispatch } from 'react-redux';

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
  const [prefersBitcoin, setPrefersBitcoin] = useState(false);
  const currencyCode = 'INR';
  // const dispatch = useDispatch()
  // const currencyKind: CurrencyKind = useCurrencyKind()
  // const currencyCode = useCurrencyCode()
  // const prefersBitcoin = useMemo( () => {
  //   if ( !currencyKind ) return true
  //   return currencyKind === CurrencyKind.BITCOIN
  // }, [ currencyKind ] )
  // const { exchangeRates } = useAccountsState()

  function changeType() {
    setPrefersBitcoin(!prefersBitcoin);
    // dispatch( currencyKindSet(
    //     prefersBitcoin ? CurrencyKind.FIAT : CurrencyKind.BITCOIN
    //   ) )
  }

  return (
    <TouchableOpacity disabled={true} activeOpacity={0.6} onPress={() => changeType()}>
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
            height={8}
            width={8}
            borderRadius={16}
            backgroundColor={!prefersBitcoin ? '#fcfcfc' : null}
            alignSelf={prefersBitcoin ? 'flex-end' : 'flex-start'}
            marginRight={prefersBitcoin ? 1 : 0}
            marginLeft={prefersBitcoin ? 0 : 1}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <IconDoller />
          </Box>
          <Box
            height={8}
            width={8}
            borderRadius={16}
            backgroundColor={prefersBitcoin ? '#fcfcfc' : null}
            alignSelf={prefersBitcoin ? 'flex-end' : 'flex-start'}
            marginRight={prefersBitcoin ? 1 : 0}
            marginLeft={prefersBitcoin ? 0 : 1}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <IconBitcoin />
          </Box>
        </Box>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default CurrencyTypeSwitch;
