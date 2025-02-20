import { StyleSheet, View } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { hp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { ScrollView } from 'react-native-gesture-handler';
import SigningDevicesIllustration from 'src/assets/images/illustration_SD.svg';
import HardwareSignerBlack from 'src/assets/images/SignerHardware.svg';
import HardwareSignerWhite from 'src/assets/images/SignerWhiteHardware.svg';
import MobileKeyBlack from 'src/assets/images/signerSoftwareBlack.svg';
import MobileKeyWhite from 'src/assets/images/signerSoftwareWhite.svg';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { setSdIntroModal } from 'src/store/reducers/vaults';
import { CommonActions } from '@react-navigation/native';
import { VaultScheme, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import SDCategoryCard from './components/SDCategoryCard';
import { SignerCategory, SignerType, VaultType } from 'src/services/wallets/enums';
import { SDIcons } from './SigningDeviceIcons';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';

function SignerCategoryList({
  scheme,
  addSignerFlow = false,
  vaultId,
  vaultSigners,
  vaultType,
  navigation,
  setShowOpenSignerModal,
}: {
  scheme: VaultScheme;
  addSignerFlow?: boolean;
  vaultId: string;
  vaultSigners?: VaultSigner[];
  vaultType?: VaultType;
  navigation: any;
  setShowOpenSignerModal: (show: boolean) => void;
}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const dispatch = useAppDispatch();
  const sdModal = useAppSelector((state) => state.vault.sdIntroModal);
  const isDarkMode = colorMode === 'dark';
  const { signer, common } = translations;

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
    Icon: SDIcons(type, isTrue, 9, 13).Icon,
    backgroundColor: `${colorMode}.${background}`,
  }));

  const signerCategoriesData = [
    {
      title: signer.addKeyHardware,
      description: signer.connectHardware,
      signerCategory: SignerCategory.HARDWARE,
      headerTitle: signer.hardwareKeysHeader,
      headerSubtitle: signer.connectHardwareDevices,
      Icon: isDarkMode ? <HardwareSignerWhite /> : <HardwareSignerBlack />,
      snippet: hardwareSnippet,
    },
    {
      title: signer.addSoftwareKey,
      description: signer.keysInApp,
      signerCategory: SignerCategory.SOFTWARE,
      headerTitle: signer.softwareKeysHeader,
      headerSubtitle: signer.keysNoHardwareNeeded,
      Icon: isDarkMode ? <MobileKeyWhite /> : <MobileKeyBlack />,
      snippet: [],
    },
  ];

  const handlePress = (category) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'SigningDeviceList',
        params: {
          scheme,
          vaultType,
          addSignerFlow,
          vaultId,
          vaultSigners,
          signerCategory: category.signerCategory,
          headerTitle: category.headerTitle,
          headerSubtitle: category.headerSubtitle,
        },
      })
    );
    setShowOpenSignerModal(false);
  };

  const signerCategories = signerCategoriesData.map((category) => ({
    ...category,
    onPress: () => handlePress(category),
  }));

  function LearnMoreModalContent() {
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
    <Box>
      <Box style={styles.scrollViewWrapper}>
        <ScrollView showsVerticalScrollIndicator={false} testID={'Signer_Scroll'}>
          <Box style={styles.categoryContainer}>
            {signerCategories.map((item, index) => (
              <SDCategoryCard
                key={index}
                title={item.title}
                description={item.description}
                Icon={item.Icon}
                onPress={item.onPress}
                snippet={item.snippet}
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
        Content={LearnMoreModalContent}
        DarkCloseIcon
        buttonText={common.Okay}
        secondaryButtonText={common.needHelp}
        buttonTextColor={`${colorMode}.whiteButtonText`}
        buttonBackground={`${colorMode}.whiteButtonBackground`}
        secButtonTextColor={`${colorMode}.whiteSecButtonText`}
        secondaryIcon={<ConciergeNeedHelp />}
        secondaryCallback={() => {
          dispatch(setSdIntroModal(false));
          navigation.dispatch(
            CommonActions.navigate({
              name: 'CreateTicket',
              params: {
                tags: [ConciergeTag.KEYS],
                screenName: 'signing-device-list',
              },
            })
          );
        }}
        buttonCallback={() => {
          dispatch(setSdIntroModal(false));
        }}
      />
    </Box>
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
  },
  categoryContainer: {
    gap: hp(10),
  },
  alignCenter: {
    alignSelf: 'center',
  },
});

export default SignerCategoryList;
