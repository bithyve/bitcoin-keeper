import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput } from 'react-native';
// libraries
import { Box, Input, View } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import { QRreader } from 'react-native-qr-decode-image-camera';

import Colors from 'src/theme/Colors';
import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import { LocalizationContext } from 'src/common/content/LocContext';
import Note from 'src/components/Note/Note';
import { RNCamera } from 'react-native-camera';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import BitcoinInput from 'src/assets/images/btc_input.svg';
// components
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import UploadImage from 'src/components/UploadImage';
import useToastMessage from 'src/hooks/useToastMessage';
import CameraUnauthorized from 'src/components/CameraUnauthorized';
import { getCurrencyImageByRegion } from 'src/common/constants/Bitcoin';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import Buttons from 'src/components/Buttons';

function ImportWalletDetailsScreen({ route }) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { useQuery } = useContext(RealmWrapperContext);

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { home } = translations;
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(false); // this state will handle error

  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);

  const onNextClick = () => {
    navigation.navigate('AddDetailsFinal')
  };

  return (
    <ScreenWrapper backgroundColor="light.mainBackground">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <HeaderTitle
          title={home.ImportWallet}
          subtitle="Add details"
          headerTitleColor={Colors.TropicalRainForest}
          paddingTop={hp(5)}
        />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
            <Box style={[styles.textInputWrapper, { marginTop: hp(15) }]}>
              <TextInput placeholder="Enter wallet name" style={styles.textInput} />
            </Box>
            <Box style={styles.textInputWrapper}>
              <TextInput placeholder="Add Description" style={styles.textInput} />
            </Box>
            <Text style={styles.transferText}>Auto transfer initiated at (optional)</Text>
            <Box flexDirection="row" alignItems="center" style={styles.amountWrapper}>
              <Box marginRight={2}>
                {getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BitcoinInput)}
              </Box>
              <Box
                marginLeft={2}
                width={0.5}
                backgroundColor="light.divider"
                opacity={0.3}
                height={7}
              />
              <Input
                placeholder="Enter Amount"
                placeholderTextColor="light.greenText"
                color="light.greenText"
                opacity={0.5}
                width="90%"
                fontSize={14}
                fontWeight={300}
                letterSpacing={1.04}
                borderWidth="0"
                value={amount}
                onChangeText={(value) => {
                  if (!isNaN(Number(value))) {
                    setAmount(
                      value
                        .split('.')
                        .map((el, i) => (i ? el.split('').join('') : el))
                        .join('.')
                    );
                  }
                }}
                keyboardType="decimal-pad"
              />
            </Box>
            <Text style={styles.balanceCrossesText}>
              When the wallet balance crosses this amount, a transfer to the Vault is initiated for
              user approval
            </Text>
          </Box>
        </ScrollView>
        <View style={styles.dotContainer}>
          <View style={{ flexDirection: 'row', marginTop: hp(15) }}>
            {[1, 2, 3].map((item, index) => {
              return (
                <View key={index} style={1 == index ? styles.selectedDot : styles.unSelectedDot} />
              );
            })}
          </View>
          <Box style={styles.ctaBtnWrapper}>
            <Box ml={windowWidth * -0.09}>
              <Buttons
                secondaryText="Cancel"
                secondaryCallback={() => {
                  navigation.goBack();
                }}
                primaryText="Next"
                // primaryDisable={Boolean(!amount || error)}
                primaryDisable={false}
                primaryCallback={onNextClick}
              />
            </Box>
          </Box>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = ScaledSheet.create({
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
    fontSize: 12,
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: '0.20@s',
  },
  qrContainer: {
    alignSelf: 'center',
    marginVertical: hp(40),
    flex: 1,
  },
  scrollViewWrapper: {
    flex: 1,
  },
  textInput: {
    width: '100%',
    backgroundColor: Colors.Isabelline,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
    fontFamily: Fonts.RobotoCondensedRegular,
  },
  cameraView: {
    height: hp(250),
    width: wp(375),
  },
  qrcontainer: {
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: hp(25),
    alignItems: 'center',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(100),
    width: wp(330),
    borderRadius: hp(10),
    marginHorizontal: wp(12),
    paddingHorizontal: wp(25),
    marginTop: hp(5),
  },
  buttonBackground: {
    backgroundColor: '#FAC48B',
    width: 40,
    height: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteWrapper: {
    marginTop: hp(35),
    // position: 'absolute',
    // bottom: windowHeight > 680 ? hp(20) : hp(8),
    width: '100%',
  },
  sendToWalletWrapper: {
    marginTop: windowHeight > 680 ? hp(20) : hp(10),
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(20),
  },
  selectedDot: {
    width: 25,
    height: 5,
    borderRadius: 5,
    backgroundColor: Colors.DimGray,
    marginEnd: 5,
  },
  unSelectedDot: {
    width: 6,
    height: 5,
    borderRadius: 5,
    backgroundColor: Colors.GrayX11,
    marginEnd: 5,
  },
  textInputWrapper: {
    flexDirection: 'row',
    marginTop: hp(5),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferText: {
    width: '100%',
    color: Colors.Feldgrau,
    marginHorizontal: 20,
    // padding: 20,
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: 12,
    marginTop: hp(22),
    letterSpacing: 0.6,
  },
  amountWrapper: {
    marginHorizontal: 20,
    marginTop: hp(10),
  },
  balanceCrossesText: {
    width: '100%',
    color: Colors.Feldgrau,
    marginHorizontal: 20,
    // padding: 20,
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: 12,
    marginTop: hp(10),
    letterSpacing: 0.6,
  },
  ctaBtnWrapper: {
    // marginBottom: hp(5),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
export default ImportWalletDetailsScreen;
