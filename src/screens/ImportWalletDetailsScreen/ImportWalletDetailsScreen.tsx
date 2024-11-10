import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Box, Input, View, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import Buttons from 'src/components/Buttons';
import { maxTransferPolicyThreshold } from 'src/store/sagas/storage';

function ImportWalletDetailsScreen({ route }) {
  const navigation = useNavigation();

  const { translations } = useContext(LocalizationContext);
  const { home, importWallet } = translations;

  const { importedKey, importedKeyDetails, type, name, description } = route.params;
  const transferPolicy = null;

  const [walletName, setWalletName] = useState(name || '');
  const [walletDescription, setWalletDescription] = useState(description || '');

  const onNextClick = () => {
    navigation.navigate('AddDetailsFinal', {
      type, // walletType
      description: walletDescription,
      name: walletName,
      importedKey,
      importedKeyDetails,
      policy: transferPolicy,
    });
  };

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
                _input={
                  colorMode === 'dark' && {
                    selectionColor: Colors.SecondaryWhite,
                    cursorColor: Colors.SecondaryWhite,
                  }
                }
              />
            </Box>
            <Box style={styles.textInputWrapper}>
              <Input
                placeholder={importWallet.addDescription}
                style={styles.textInput}
                borderWidth="0"
                backgroundColor={`${colorMode}.seashellWhite`}
                value={walletDescription}
                onChangeText={(text) => setWalletDescription(text)}
                _input={
                  colorMode === 'dark' && {
                    selectionColor: Colors.SecondaryWhite,
                    cursorColor: Colors.SecondaryWhite,
                  }
                }
              />
            </Box>
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
    flexDirection: 'row',
    marginHorizontal: 2,
    alignItems: 'center',
    borderRadius: 5,
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
