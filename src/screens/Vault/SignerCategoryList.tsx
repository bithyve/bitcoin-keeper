import { StyleSheet, View } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { hp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import KeeperHeader from 'src/components/KeeperHeader';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import SigningDevicesIllustration from 'src/assets/images/illustration_SD.svg';
import HardwareSignerBlack from 'src/assets/images/hardware-signer-black.svg';
import HardwareSignerWhite from 'src/assets/images/hardware-signer-white.svg';
import MobileKeyBlack from 'src/assets/images/mobile_key.svg';
import MobileKeyWhite from 'src/assets/images/mobile_key_light.svg';
import AssistedSignerBlack from 'src/assets/images/assisted-signer-black.svg';
import AssistedSignerWhite from 'src/assets/images/assisted-signer-white.svg';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { setSdIntroModal } from 'src/store/reducers/vaults';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { VaultScheme, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { useDispatch } from 'react-redux';
import { goToConcierge } from 'src/store/sagaActions/concierge';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import SDCategoryCard from './components/SDCategoryCard';
import { SignerCategory } from 'src/services/wallets/enums';

function SignerCategoryList() {
  const route = useRoute();
  const {
    scheme,
    addSignerFlow = false,
    vaultId,
    vaultSigners,
  }: {
    scheme: VaultScheme;
    addSignerFlow: boolean;
    vaultId: string;
    vaultSigners?: VaultSigner[];
  } = route.params as any;
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const dispatch = useAppDispatch();
  const reduxDispatch = useDispatch();
  const sdModal = useAppSelector((state) => state.vault.sdIntroModal);
  const isDarkMode = colorMode === 'dark';
  const { vault, signer, common } = translations;

  const signerCategoriesData = [
    {
      title: signer.addKeyHardware,
      description: signer.connectHardware,
      signerCategory: SignerCategory.HARDWARE,
      headerTitle: signer.hardwareKeysHeader,
      headerSubtitle: signer.connectHardwareDevices,
      Icon: isDarkMode ? <HardwareSignerWhite /> : <HardwareSignerBlack />,
    },
    {
      title: signer.addSoftwareKey,
      description: signer.keysInApp,
      signerCategory: SignerCategory.SOFTWARE,
      headerTitle: signer.softwareKeysHeader,
      headerSubtitle: signer.keysNoHardwareNeeded,
      Icon: isDarkMode ? <MobileKeyWhite /> : <MobileKeyBlack />,
    },
    {
      title: signer.addAssistedKey,
      description: signer.keysOnServer,
      signerCategory: SignerCategory.ASSISTED,
      headerTitle: signer.assistedKeysHeader,
      headerSubtitle: signer.keysKeptOnServer,
      Icon: isDarkMode ? <AssistedSignerWhite /> : <AssistedSignerBlack />,
    },
  ];

  const handlePress = (category) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'SigningDeviceList',
        params: {
          scheme,
          addSignerFlow,
          vaultId,
          vaultSigners,
          signerCategory: category.signerCategory,
          headerTitle: category.headerTitle,
          headerSubtitle: category.headerSubtitle,
        },
      })
    );
  };

  const signerCategories = signerCategoriesData.map((category) => ({
    ...category,
    onPress: () => handlePress(category),
  }));

  function VaultSetupContent() {
    return (
      <View>
        <Box style={styles.alignCenter}>
          <SigningDevicesIllustration />
        </Box>
        <Text color={`${colorMode}.modalGreenContent`} style={styles.modalText}>
          {`${signer.subscriptionTierL1} ${SubscriptionTier.L1} ${signer.subscriptionTierL2} ${SubscriptionTier.L2} ${signer.subscriptionTierL3} ${SubscriptionTier.L3}.\n\n${signer.notSupportedText}`}
        </Text>
      </View>
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={vault.Addsigner}
        subtitle={vault.SelectSignerSubtitle}
        learnMore
        learnBackgroundColor={`${colorMode}.BrownNeedHelp`}
        learnTextColor={`${colorMode}.buttonText`}
        learnMorePressed={() => {
          dispatch(setSdIntroModal(true));
        }}
      />
      <Box style={styles.scrollViewWrapper}>
        <ScrollView
          style={styles.scrollViewContainer}
          contentContainerStyle={styles.contentContainerStyle}
          showsVerticalScrollIndicator={false}
          testID={'Signer_Scroll'}
        >
          <Box style={styles.categoryContainer}>
            {signerCategories.map((item, index) => (
              <SDCategoryCard
                key={index}
                title={item.title}
                description={item.description}
                Icon={item.Icon}
                onPress={item.onPress}
              />
            ))}
          </Box>
        </ScrollView>
      </Box>
      <KeeperModal
        visible={sdModal}
        close={() => {
          dispatch(setSdIntroModal(false));
        }}
        title={signer.signers}
        subTitle={signer.signerDescription}
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={VaultSetupContent}
        DarkCloseIcon
        buttonText={common.Okay}
        secondaryButtonText={common.needHelp}
        buttonTextColor={`${colorMode}.modalWhiteButtonText`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        secButtonTextColor={`${colorMode}.modalGreenSecButtonText`}
        secondaryCallback={() => {
          dispatch(setSdIntroModal(false));
          reduxDispatch(goToConcierge([ConciergeTag.KEYS], 'signing-device-list'));
        }}
        buttonCallback={() => {
          dispatch(setSdIntroModal(false));
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  modalText: {
    letterSpacing: 0.65,
    fontSize: 13,
    marginTop: 5,
    padding: 1,
  },
  scrollViewWrapper: {
    flex: 1,
    paddingHorizontal: '2.5%',
    paddingTop: '8%',
  },
  scrollViewContainer: {
    flex: 1,
  },
  contentContainerStyle: {
    flexGrow: 1,
  },
  categoryContainer: {
    gap: hp(10),
  },
  alignCenter: {
    alignSelf: 'center',
  },
});
export default SignerCategoryList;
