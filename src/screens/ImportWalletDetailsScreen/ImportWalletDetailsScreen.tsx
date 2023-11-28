import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Box, Input, View, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import BitcoinInput from 'src/assets/images/btc_black.svg';
import BitcoinWhite from 'src/assets/images/btc_white.svg';

import { useNavigation } from '@react-navigation/native';
import { getCurrencyImageByRegion } from 'src/constants/Bitcoin';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import Buttons from 'src/components/Buttons';
import { defaultTransferPolicyThreshold } from 'src/store/sagas/storage';
import Text from 'src/components/KeeperText';

function ImportWalletDetailsScreen({ route }) {
  const navigation = useNavigation();

  const { translations } = useContext(LocalizationContext);
  const { home, importWallet } = translations;

  const name = route?.params?.name;
  const desc = route?.params?.description;
  const [walletName, setWalletName] = useState(name || '');
  const [description, setDescription] = useState(desc || '');
  const [walletType, setWalletType] = useState(route?.params?.type);
  const [importedSeed, setImportedSeed] = useState(route?.params?.seed?.replace(/,/g, ' '));
  const [transferPolicy, setTransferPolicy] = useState(defaultTransferPolicyThreshold.toString());

  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);

  const onNextClick = () => {
    navigation.navigate('AddDetailsFinal', {
      type: walletType,
      description,
      name: walletName,
      seed: importedSeed,
      policy: transferPolicy,
    });
  };

  const formatNumber = (value: string) =>
    value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <KeeperHeader title={home.ImportWallet} subtitle={importWallet.addDetails} />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
            <Box style={[styles.textInputWrapper, { marginTop: hp(15) }]}>
              <Input
                placeholder={importWallet.enterWalletName}
                style={styles.textInput}
                borderWidth="0"
                backgroundColor={`${colorMode}.seashellWhite`}
                value={walletName}
                onChangeText={(text) => setWalletName(text)}
              />
            </Box>
            <Box style={styles.textInputWrapper}>
              <Input
                placeholder={importWallet.addDescription}
                style={styles.textInput}
                borderWidth="0"
                backgroundColor={`${colorMode}.seashellWhite`}
                value={description}
                onChangeText={(text) => setDescription(text)}
              />
            </Box>
            <Text style={styles.transferText} color={`${colorMode}.primaryText`}>{importWallet.autoTransfer}</Text>
            <Box style={styles.amountWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <Box mx={3}>
                {getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, colorMode === 'light' ? BitcoinInput : BitcoinWhite)}
              </Box>
              <Box
                width={0.5}
                backgroundColor={`${colorMode}.divider`}
                opacity={0.3}
                height={8}
              />
              <Input
                placeholder={importWallet.enterAmount}
                placeholderTextColor={`${colorMode}.GreyText"`}
                color={`${colorMode}.greenText`}
                width="96%"
                h={10}
                fontSize={14}
                fontWeight={300}
                letterSpacing={1.04}
                borderWidth="0"
                value={formatNumber(transferPolicy)}
                onChangeText={(value) => {
                  setTransferPolicy(value);
                }}
                variant="unstyled"
                keyboardType="numeric"
              />
            </Box>
            <Text style={styles.balanceCrossesText} color={`${colorMode}.primaryText`}>
              {importWallet.walletBalance}
            </Text>
          </Box>
        </ScrollView>
        <View style={styles.dotContainer}>
          <View style={{ flexDirection: 'row', marginTop: hp(15) }}>
            {[1, 2, 3].map((item, index) => (
              <View
                key={item.toString()}
                style={index === 1 ? styles.selectedDot : styles.unSelectedDot}
              />
            ))}
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

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    letterSpacing: 0.24,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 0.2,
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
    width: '90%',
    height: 45,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
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
    fontSize: 12,
    marginHorizontal: 2,
    marginTop: hp(22),
    letterSpacing: 0.6,
  },
  amountWrapper: {
    marginTop: hp(10),
    flexDirection: "row",
    marginHorizontal: 2,
    alignItems: "center",
    borderRadius: 5
  },
  balanceCrossesText: {
    width: '100%',
    fontSize: 12,
    marginTop: hp(10),
    letterSpacing: 0.6,
    marginHorizontal: 2,
  },
  ctaBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
export default ImportWalletDetailsScreen;
