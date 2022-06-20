import React, { useContext }from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text } from 'native-base';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import HardWare from 'src/assets/images/svgs/hardware.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import BitCoinBlack from 'src/assets/images/svgs/btc (black).svg';
import { LocalizationContext } from 'src/common/content/LocContext';

const windowHeight = Dimensions.get('window').height;

const TransectionSubmittedComponent = ({ }) => {

  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'transactions' ]

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.item}>
          <HardWare />
          <Text style={styles.text} color={'light.textBlack'} fontFamily="body" fontWeight={'200'}>
          {strings.HexaPay}
          </Text>
          <Text style={styles.text1} color={'light.textBlack'} fontFamily="body" fontWeight={'100'}>

          </Text>
        </View>
        <View style={styles.moreDetails}>
          <Text
            style={styles.amountText}
            color={'light.textBlack'}
            fontFamily="body"
            fontWeight={'100'}
          >
            <BitCoinBlack />
            {strings.amountText1}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TransectionSubmittedComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDF6F0',
    borderRadius: 10,
    height: hp(
      windowHeight >= 850
        ? '19%'
        : windowHeight >= 750
          ? '20.5%'
          : windowHeight >= 650
            ? '22%'
            : '23%'
    ),
    width: wp('83%'),
    marginBottom: hp(2),
    paddingVertical: hp(2),
  },
  innerContainer: {
    marginHorizontal: wp(5.5),
    marginTop: hp(3),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: RFValue(14),
    letterSpacing: 0.28,
  },
  text1: {
    fontSize: RFValue(10),
    letterSpacing: 0.5,
  },
  item: {
    marginVertical: hp(0.5),
  },
  moreDetails: {
    alignSelf: 'flex-end',
  },
  amountText: {
    fontSize: RFValue(24),
    letterSpacing: 1.2,
    fontWeight: '400',
  },
});
