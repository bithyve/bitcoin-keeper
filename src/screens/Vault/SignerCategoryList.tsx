import { StyleSheet, View } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { hp, windowHeight } from 'src/constants/responsive';
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
  const { vault, common } = translations;

  const signerCategories = [
    {
      title: 'Add key from a hardware',
      description: 'Connect your hardware device',

      Icon: isDarkMode ? <HardwareSignerWhite /> : <HardwareSignerBlack />,
      onPress: () => {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'SigningDeviceList',
            params: {
              scheme,
              addSignerFlow,
              vaultId,
              vaultSigners,
              signerCategory: SignerCategory.HARDWARE,
              headerTitle: 'Hardware Keys',
              headerSubtitle: 'Connect your Hardware devices',
            },
          })
        );
      },
    },
    {
      title: 'Add a software key',
      description: 'Keys generated within Keeper App',

      Icon: isDarkMode ? <MobileKeyWhite /> : <MobileKeyBlack />,
      onPress: () => {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'SigningDeviceList',
            params: {
              scheme,
              addSignerFlow,
              vaultId,
              vaultSigners,
              signerCategory: SignerCategory.SOFTWARE,
              headerTitle: 'Software Keys',
              headerSubtitle: 'Keys not needing hardware device',
            },
          })
        );
      },
    },
    {
      title: 'Add an assisted key',
      description: "Keys on Keeper's servers",
      Icon: isDarkMode ? <AssistedSignerWhite /> : <AssistedSignerBlack />,
      onPress: () => {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'SigningDeviceList',
            params: {
              scheme,
              addSignerFlow,
              vaultId,
              vaultSigners,
              signerCategory: SignerCategory.ASSISTED,
              headerTitle: 'Assisted Keys',
              headerSubtitle: 'Keys kept on server',
            },
          })
        );
      },
    },
  ];

  function VaultSetupContent() {
    return (
      <View>
        <Box style={styles.alignCenter}>
          <SigningDevicesIllustration />
        </Box>
        <Text color={`${colorMode}.modalGreenContent`} style={styles.modalText}>
          {`You can add all hardware devices from the ${SubscriptionTier.L1} Tier. Signing Server is unlocked at the ${SubscriptionTier.L2} Tier and Inheritance Key at ${SubscriptionTier.L3}.\n\nIf a particular signer is not supported, it will be indicated.`}
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
      <ScrollView
        style={styles.scrollViewWrapper}
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
      <KeeperModal
        visible={sdModal}
        close={() => {
          dispatch(setSdIntroModal(false));
        }}
        title="Signers"
        subTitle="A signer is a hardware or software that stores one of the private keys needed for your vaults"
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
    height: windowHeight > 800 ? '76%' : '74%',
    paddingHorizontal: '2.5%',
    paddingTop: '8%',
  },
  categoryContainer: {
    gap: hp(10),
  },
  alignCenter: {
    alignSelf: 'center',
  },
});
export default SignerCategoryList;
