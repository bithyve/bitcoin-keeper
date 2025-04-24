import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import SDCategoryCard from 'src/screens/Vault/components/SDCategoryCard';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { SignerCategory, SignerType } from 'src/services/wallets/enums';
import HardwareSignerBlack from 'src/assets/images/SignerHardware.svg';
import HardwareSignerWhite from 'src/assets/images/SignerWhiteHardware.svg';
import MobileKeyBlack from 'src/assets/images/signerSoftwareBlack.svg';
import MobileKeyWhite from 'src/assets/images/signerSoftwareWhite.svg';
import { CommonActions } from '@react-navigation/native';
import DashedCta from 'src/components/DashedCta';
import PrivateHardwareKey from 'src/assets/privateImages/hard-key.svg';
import PrivateSoftwareKey from 'src/assets/privateImages/soft-key.svg';

const SignerContent = ({ navigation, handleModalClose, isOnL4 }) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);

  const { signer } = translations;
  const isDarkMode = colorMode === 'dark';

  const hardwareSigners = [
    { type: SignerType.COLDCARD, background: 'dullCreamBackground', isTrue: false },
    { type: SignerType.TAPSIGNER, background: 'pantoneGreen', isTrue: true },
    { type: SignerType.JADE, background: 'brownBackground', isTrue: true },
    { type: SignerType.PASSPORT, background: 'dullCreamBackground', isTrue: false },
    { type: SignerType.SPECTER, background: 'pantoneGreen', isTrue: false },
    { type: SignerType.KEYSTONE, background: 'brownBackground', isTrue: false },
    { type: SignerType.LEDGER, background: 'dullCreamBackground', isTrue: false },
    { type: SignerType.PORTAL, background: 'pantoneGreen', isTrue: false },
    { type: SignerType.TREZOR, background: 'brownBackground', isTrue: false },
    { type: SignerType.BITBOX02, background: 'dullCreamBackground', isTrue: false },
  ];

  const hardwareSnippet = hardwareSigners.map(({ type, background, isTrue }) => ({
    Icon: SDIcons({ type, light: isTrue, width: 9, height: 13 }).Icon,
    backgroundColor: `${colorMode}.${background}`,
  }));

  const signerCategoriesData = [
    {
      title: signer.addKeyHardware,
      description: signer.connectHardware,
      signerCategory: SignerCategory.HARDWARE,
      headerTitle: signer.hardwareKeysHeader,
      headerSubtitle: signer.connectHardwareDevices,
      Icon: isOnL4 ? (
        <PrivateHardwareKey />
      ) : isDarkMode ? (
        <HardwareSignerWhite />
      ) : (
        <HardwareSignerBlack width={22} height={22} />
      ),
      snippet: hardwareSnippet,
    },
    {
      title: signer.addSoftwareKey,
      description: signer.keysInApp,
      signerCategory: SignerCategory.SOFTWARE,
      headerTitle: signer.softwareKeysHeader,
      headerSubtitle: signer.keysNoHardwareNeeded,
      Icon: isOnL4 ? <PrivateSoftwareKey /> : isDarkMode ? <MobileKeyWhite /> : <MobileKeyBlack />,
      snippet: [],
    },
  ];

  const handlePress = (category) => {
    if (handleModalClose) {
      handleModalClose();
    }
    navigation.dispatch(
      CommonActions.navigate({
        name: 'SigningDeviceList',
        params: {
          addSignerFlow: true,
          signerCategory: category.signerCategory,
          headerTitle: category.headerTitle,
          headerSubtitle: category.headerSubtitle,
        },
      })
    );
  };

  return (
    <Box style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {signerCategoriesData.map((category, index) => (
          <SDCategoryCard
            key={index}
            title={category.title}
            description={category.description}
            Icon={category.Icon}
            snippet={category.snippet}
            onPress={() => handlePress(category)}
          />
        ))}
        <DashedCta
          backgroundColor={`${colorMode}.dullGreen`}
          borderColor={`${colorMode}.pantoneGreen`}
          textColor={`${colorMode}.greenWhiteText`}
          name={signer.purchaseWallet}
          cardStyles={styles.cardStyles}
          callback={() => {
            navigation.navigate('HardwareWallet');
            handleModalClose();
          }}
        />
      </ScrollView>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    gap: hp(10),
  },
  cardStyles: {
    minHeight: hp(56),
  },
});

export default SignerContent;
