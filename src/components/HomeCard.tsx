import React from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { View, Text } from 'native-base';

import HomeCardImage from '../assets/images/homecard.png';
import AddSCardIcon from '../assets/images/svgs/card_add.svg';
import BtcIcon from '../assets/images/svgs/btc.svg';
import BlueWalletIcon from 'src/assets/images/svgs/blue_wallet.svg';

const windowHeight = Dimensions.get('window').height;

const getCardheight = () => {
  if (windowHeight >= 850) {
    return 5;
  } else if (windowHeight >= 750) {
    return 3;
  } else if (windowHeight >= 650) {
    return 1;
  }
};

const HomeCard = ({
  Icon = BlueWalletIcon,
  name = 'Name',
  description = 'Description',
  type = 'Single-Sig',
  balance = '8585',
  isEnd,
  index,
  isImported = true,
}) => {
  const navigation = useNavigation();
  return (
    <View>
      <ImageBackground resizeMode="stretch" style={styles.homeCard} source={HomeCardImage}>
        {isEnd ? (
          <TouchableOpacity
            style={styles.addWalletContainer}
            onPress={() => navigation.navigate('AddWallet Screen')}
          >
            <AddSCardIcon />
            <Text
              style={styles.addWalletText}
              color={'light.white'}
              fontFamily={'body'}
              fontWeight={'300'}
            >
              Add Wallet
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.cardHeader}>
              <View style={styles.keepersContainer}>
                <Text
                  style={styles.headerKeeperText}
                  color={'light.white'}
                  fontFamily={'body'}
                  fontWeight={'300'}
                >
                  {isImported ? `3 Keepers & 1 Signers` : `2 Keepers`}
                </Text>
              </View>

              <View
                style={styles.hexaWalletContainer}
                background={isImported ? 'light.lightBlue' : 'none'}
              >
                <Text
                  style={styles.hexaWalletText}
                  color={'light.lightBlack'}
                  fontFamily={'body'}
                  fontWeight={'300'}
                >
                  {isImported ? 'Imported' : <></>}
                </Text>
              </View>
            </View>
            <View style={styles.walletContainer}>
              <TouchableOpacity>
                <Icon />
              </TouchableOpacity>
              <Text
                style={styles.walletName}
                color={'light.white'}
                fontFamily={'body'}
                fontWeight={'100'}
              >
                {type}
              </Text>
            </View>

            <View style={styles.fundsContainer}>
              <Text
                style={styles.fundstitle}
                color={'light.white'}
                fontFamily={'body'}
                fontWeight={'200'}
              >
                {name}
              </Text>
              <Text
                style={styles.fundsSubtitle}
                color={'light.white'}
                fontFamily={'body'}
                fontWeight={'100'}
              >
                {description}
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
                {balance}
              </Text>
            </View>
          </>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = ScaledSheet.create({
  homeCard: {
    width: wp(42),
    height: hp(31),
    marginTop: hp(1.5),
    padding: '6@s',
    marginLeft: wp(2),
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
    borderRadius: '10@s',
  },
  walletName: {
    fontSize: RFValue(10),
    letterSpacing: '0.2@s',
    lineHeight: '20@s',
  },
  walletContainer: {
    marginTop: hp(getCardheight()),
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
    lineHeight: '24@s',
    marginLeft: wp(1),
  },
  addWalletContainer: {
    padding: '10@s',
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(28),
  },
  addWalletText: {
    fontSize: RFValue(12),
    letterSpacing: '0.8@s',
    lineHeight: '20@s',
    marginTop: wp(1),
  },
});
export default HomeCard;
