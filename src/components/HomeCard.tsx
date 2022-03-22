import React from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { ImageBackground } from 'react-native';
import { View, Text } from 'native-base';

import HomeCardImage from '../assets/Images/homecard.png';
import { background } from 'native-base/lib/typescript/theme/styled-system';


const HomeCard = () => {
  return (
    <View>
      <ImageBackground style={styles.homeCard} source={HomeCardImage}>
        <View style={styles.cardHeader}>

          <View style={styles.keepersContainer}>
            <Text style={styles.headerKeeperText} color={'light.white'} fontFamily={'body'} fontWeight={'300'}>3{' '}</Text>
            <Text style={styles.headerKeeperText} color={'light.white'} fontFamily={'body'} fontWeight={'100'}>Keepers &{' '}</Text>
            <Text style={styles.headerKeeperText} color={'light.white'} fontFamily={'body'} fontWeight={'300'}>1 </Text>
            <Text style={styles.headerKeeperText} color={'light.white'} fontFamily={'body'} fontWeight={'100'}>Singer</Text>
          </View>

          <View style={styles.hexaWalletContainer} background={'light.brown'}>
            <Text style={styles.hexaWalletText} color={'light.lightBlack'} fontFamily={'body'} fontWeight={'300'}>Hexa Wallet</Text>
          </View>

        </View>
        <View style={styles.walletContainer}>
          <View style={{ backgroundColor: 'red', borderRadius: 50, width: 40, height: 40 }} />
          <Text style={styles.walletName} color={'light.white'} fontFamily={'body'} fontWeight={'100'}>Single-sig</Text>
        </View>

        <View style={styles.fundsContainer}>
          <Text style={styles.fundstitle} color={'light.white'} fontFamily={'body'} fontWeight={'200'}>Maldives Funds</Text>
          <Text style={styles.fundsSubtitle} color={'light.white'} fontFamily={'body'} fontWeight={'100'}>lorem ipsum dolor</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.fundstitle} color={'light.white'} fontFamily={'body'} fontWeight={'200'}>B</Text>
          <Text style={styles.priceText} color={'light.white'} fontFamily={'body'} fontWeight={'200'}>0.000024</Text>
        </View>

      </ImageBackground>
    </View>
  );
};

const styles = ScaledSheet.create({
  homeCard: {
    width: wp(42),
    height: hp(30),
    marginTop: hp(1.5),
    padding: '6@s',
    marginRight:wp(2)
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  keepersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerKeeperText: {
    fontSize: RFValue(8),
    letterSpacing: '0.4@s',
    lineHeight: '18@s',
  },
  hexaWalletText: {
    fontSize: RFValue(8),
    letterSpacing: '0.7@s',
    lineHeight: '12@s',
  },
  hexaWalletContainer: {
    paddingHorizontal: wp(0.6),
    height: hp(1.6),
    borderRadius: '10@s'
  },
  walletName: {
    fontSize: RFValue(10),
    letterSpacing: '0.2@s',
    lineHeight: '20@s',
  },
  walletContainer: {
    marginTop: hp(5),
    marginLeft: wp(2),
  },
  fundsContainer: {
    marginTop: hp(2),
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
    marginTop: hp(3),
    marginLeft: wp(1.5),
  },
  priceText: {
    fontSize: RFValue(24),
    letterSpacing: '0.5@s',
    lineHeight: '27@s',
    marginLeft: wp(1)
  }
});
export default HomeCard;
