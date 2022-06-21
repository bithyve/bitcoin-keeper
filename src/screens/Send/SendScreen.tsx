import React, { useRef, useContext } from 'react';
import { TextInput } from 'react-native';
// libraries
import { View, Box, Pressable, Text } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { ScaledSheet } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';
import { RNCamera } from 'react-native-camera';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
// components
import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
// Colors, Images, svgs
import Colors from 'src/theme/Colors';
import InfoBox from 'src/components/InfoBox';
import IconWallet from 'src/assets/images/svgs/icon_wallet.svg';
import BlueWallet from 'src/assets/icons/bluewallet.svg';

import { LocalizationContext } from 'src/common/content/LocContext';

const SendScreen = () => {
  const cameraRef = useRef<RNCamera>();
  const navigtaion = useNavigation();

  const { translations } = useContext( LocalizationContext )
  const common = translations[ 'common' ]
  const home = translations[ 'home' ]

  return (
    <View style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title={common.send}
        subtitle={common.smalldesc}
        onPressHandler={() => navigtaion.goBack()}
        color={'light.ReceiveBackground'}
      />
      {/* {QR Scanner} */}
      <Box style={styles.qrcontainer} marginY={hp(2)}>
        <RNCamera ref={cameraRef} style={styles.cameraView} captureAudio={false} />
      </Box>
      {/* send manually option */}
      <Box
        flexDirection={'row'}
        marginY={hp(2)}
        width={'100%'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <TextInput placeholder="or enter address manually" style={styles.textInput} />
      </Box>
      {/* Send to Wallet options */}
      <Text
        mb={'5'}
        ml={'4'}
        color={'light.GreyText'}
        fontWeight={200}
        fontFamily={'body'}
        fontSize={14}
        letterSpacing={0.6}
      >
        Send to Wallet
      </Text>
      <View flexDirection={'row'} style={styles.walletContainer}>
        <Box mt={'3'}>
          <Box>
            <View style={styles.buttonBackground}>
              <Pressable onPress={() => console.log('wallet')} style={styles.buttonPressable}>
                <IconWallet />
              </Pressable>
            </View>
          </Box>
          <Box>
            <Text fontFamily={'body'} fontWeight={'100'} fontSize={12} mt={'1'}>
              Maldives
            </Text>
          </Box>
        </Box>
        <Box mt={'3'}>
          <Box>
            <View style={styles.buttonBackground}>
              <Pressable onPress={() => console.log('wallet')} style={styles.buttonPressable}>
                <BlueWallet />
              </Pressable>
            </View>
          </Box>
          <Box>
            <Text fontFamily={'body'} fontWeight={'100'} fontSize={12} mt={'1'}>
              Alex's Wallet
            </Text>
          </Box>
        </Box>
        <Box mt={'3'}>
          <Box>
            <View style={styles.buttonBackground}>
              <Pressable onPress={() => console.log('wallet')} style={styles.buttonPressable}>
                <IconWallet />
              </Pressable>
            </View>
          </Box>
          <Box>
            <Text fontFamily={'body'} fontWeight={'100'} fontSize={12} mt={'1'}>
              Retirement
            </Text>
          </Box>
        </Box>
      </View>
      {/* {Input Field} */}

      {/* {Bottom note} */}
      <Box position={'absolute'} bottom={4} marginX={2}>
        <InfoBox
          title={common.note}
          desciption={home.reflectSats}
          width={'65%'}
        />
      </Box>
    </View>
  );
};

const styles = ScaledSheet.create({
  Container: {
    position: 'relative',
    flex: 1,
    padding: 8,
  },
  linearGradient: {
    borderRadius: 6,
    marginTop: hp(3),
  },
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: RFValue(12),
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: RFValue(10),
    letterSpacing: '0.20@s',
  },
  qrContainer: {
    alignSelf: 'center',
    marginVertical: hp('40%'),
    flex: 1,
  },
  textInput: {
    width: '90%',
    backgroundColor: Colors?.textInputBackground,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 25,
  },
  cameraView: {
    height: hp('37'),
  },
  qrcontainer: {
    overflow: 'hidden',
    borderRadius: 10,
  },
  walletContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#FCF6EF',
    height: hp('11'),
    width: wp('90'),
    borderRadius: 12,
    marginHorizontal: wp('3%'),
  },
  buttonBackground: {
    backgroundColor: '#FAC48B',
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  buttonPressable: {
    alignItems: 'center',
    marginVertical: 14,
  },
});
export default SendScreen;
