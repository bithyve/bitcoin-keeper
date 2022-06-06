import React from 'react';
import { ImageBackground, TouchableOpacity } from 'react-native';
import { Text, View, Pressable } from 'native-base';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
// components
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
// icons and images
import { getResponsiveHome, windowHeight } from 'src/common/data/responsiveness/responsive';
import HomeCardImage from 'src/assets/images/homecard.png';
import BtcIcon from 'src/assets/images/svgs/btc.svg';
import BlueWalletIcon from 'src/assets/images/svgs/blue_wallet.svg';

const WalletCard = () => {
  return (
    <ImageBackground resizeMode="stretch" style={styles.homeCard} source={HomeCardImage}>
      <View style={styles.cardHeader}>
        <View
          style={styles.hexaWalletContainer}
          background={'light.lightBlue'}
        >
          <Text
            style={styles.hexaWalletText}
            color={'light.lightBlack'}
            fontFamily={'body'}
            fontWeight={'300'}
          >
            External
          </Text>
        </View>
      </View>
      <View style={styles.walletContainer}>
        <TouchableOpacity>
          <BlueWalletIcon />
        </TouchableOpacity>

        <View style={styles.fundsContainer}>
          <Text
            style={styles.fundstitle}
            color={'light.white'}
            fontFamily={'body'}
            fontWeight={'200'}
          >
            name
          </Text>
          <Text
            style={styles.fundsSubtitle}
            color={'light.white'}
            fontFamily={'body'}
            fontWeight={'100'}
          >
            description
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <BtcIcon />
          <Text
            style={styles.priceText}
            color={'light.white'}
            fontFamily={'body'}
            fontWeight={'200'}
          >
            0.000024
          </Text>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: hp(getResponsiveHome().padingTop),
    paddingHorizontal: wp(10),
  },
  button: {
    borderRadius: 10,
    marginTop: hp(1),
    width: 80,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAC48B'
  },
  flatlistContainer: {
    maxHeight: hp(30),
  },
  homeCard: {
    width: wp(37),
    height: hp(windowHeight >= 850 ? 24 : windowHeight >= 750 ? 26 : 28),
    marginTop: hp(2),
    padding: '6@s',
    marginLeft: wp(2),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '3@s'
  },

  hexaWalletText: {
    fontSize: RFValue(8),
    letterSpacing: '0.7@s',
    lineHeight: '12@s',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexaWalletContainer: {
    paddingHorizontal: wp(0.6),
    height: hp(1.6),
    borderRadius: '10@s',
  },

  walletContainer: {
    marginLeft: wp(1),
  },
  fundsContainer: {
    marginTop: hp(2),
    marginBottom: hp(3),
    marginLeft: wp(2),
  },
  fundstitle: {
    fontSize: RFValue(12),
    letterSpacing: '0.5@s',
    lineHeight: '16@s',
  },
  fundsSubtitle: {
    fontSize: RFValue(10),
    letterSpacing: '0.5@s',
    lineHeight: '12@s',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1),
  },
  priceText: {
    fontSize: RFValue(24),
    letterSpacing: '0.5@s',
    lineHeight: '24@s',
    marginLeft: wp(1),
  },


});
export default WalletCard;