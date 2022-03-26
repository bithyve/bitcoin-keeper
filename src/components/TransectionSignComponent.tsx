import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text } from 'native-base';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import HardWare from 'src/assets/images/svgs/hardware.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import BitCoinBlack from 'src/assets/images/svgs/btc (black).svg';

const windowHeight = Dimensions.get('window').height;

const TransectionSignComponent = ({}) => {
  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        <View style={styles.item}>
          <HardWare />
          <Text style={styles.text} color={'light.textBlack'} fontFamily="body" fontWeight={'200'}>
            Hexa Pay
          </Text>
          <Text style={styles.text1} color={'light.textBlack'} fontFamily="body" fontWeight={'100'}>
            lorem ipsum dolor
          </Text>
        </View>
        <View style={styles.moreDetails}>
          <Text
            style={styles.moreDetailText}
            color={'light.textBlack'}
            fontFamily="body"
            fontWeight={'300'}
          >
            More Details
          </Text>
        </View>
      </View>
      <View style={styles.lowerContainer}>
        <View style={styles.lowerContainerItem}>
          <Text
            style={styles.detailText}
            color={'light.textBlack'}
            fontFamily="body"
            fontWeight={'100'}
          >
            To
          </Text>
          <Text
            style={styles.emailText}
            color={'light.textBlack'}
            fontFamily="body"
            fontWeight={'100'}
          >
            jadsf8era…a9wer9we09
          </Text>
        </View>
        <View style={styles.lowerContainerItem}>
          <Text
            style={styles.detailText}
            color={'light.textBlack'}
            fontFamily="body"
            fontWeight={'100'}
          >
            Amount
          </Text>
          <View>
            <Text
              style={styles.amountText}
              color={'light.textBlack'}
              fontFamily="body"
              fontWeight={'100'}
            >
              <BitCoinBlack />
              0.000024
            </Text>
          </View>
        </View>
        <View style={styles.lowerContainerItem}>
          <Text
            style={styles.detailText}
            color={'light.textBlack'}
            fontFamily="body"
            fontWeight={'100'}
          >
            Fees
          </Text>
          <Text
            style={styles.feeText}
            color={'light.textBlack'}
            fontFamily="body"
            fontWeight={'100'}
          >
            <BitCoinBlack />
            0.000004
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TransectionSignComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDF6F0',
    borderRadius: 10,
    height: hp(
      windowHeight >= 850
        ? '35%'
        : windowHeight >= 750
        ? '37%'
        : windowHeight >= 650
        ? '39%'
        : '40%'
    ),
    width: wp('83%'),
    marginBottom: hp(2),
  },
  upperContainer: {
    marginHorizontal: wp(5),
    marginTop: hp(3),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lowerContainer: {
    marginHorizontal: wp(5),
    marginVertical: hp(3),
  },
  lowerContainerItem: {
    marginVertical: hp(1.5),
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
  name: {
    fontSize: RFValue(20),
    letterSpacing: 1,
  },
  item: {
    marginVertical: hp(0.5),
  },
  moreDetails: {
    backgroundColor: '#EBB77D',
    alignSelf: 'flex-start',
    borderRadius: 10,
  },
  moreDetailText: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  detailText: {
    fontSize: RFValue(12),
    letterSpacing: 0.6,
    fontWeight: '300',
  },
  amountText: {
    fontSize: RFValue(24),
    letterSpacing: 1.2,
    fontWeight: '400',
  },
  feeText: {
    fontSize: RFValue(20),
    letterSpacing: 1,
    fontWeight: '400',
  },
  emailText: {
    fontSize: RFValue(10),
    letterSpacing: 0.5,
    fontWeight: '400',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(3),
    marginLeft: wp(1.5),
  },
});
