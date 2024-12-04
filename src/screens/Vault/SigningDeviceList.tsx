import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import usePlan from 'src/hooks/usePlan';
import NFC from 'src/services/nfc';
import SigningDeviceCard from './components/SigningDeviceCard';
import { VaultScheme, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { useRoute } from '@react-navigation/native';
import { SignerCategory, SignerType } from 'src/services/wallets/enums';
import { getDeviceStatus, getSDMessage } from 'src/hardware';
import useSigners from 'src/hooks/useSigners';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import KeeperModal from 'src/components/KeeperModal';
import { setSdIntroModal } from 'src/store/reducers/vaults';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { ConciergeTag, goToConcierge } from 'src/store/sagaActions/concierge';
import Text from 'src/components/KeeperText';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import SigningDevicesIllustration from 'src/assets/images/illustration_SD.svg';

const SigningDeviceList = () => {
  const route = useRoute();
  const {
    scheme,
    addSignerFlow = false,
    vaultId,
    vaultSigners,
    signerCategory,
    headerTitle,
    headerSubtitle,
  }: {
    scheme: VaultScheme;
    addSignerFlow: boolean;
    vaultId: string;
    vaultSigners?: VaultSigner[];
    signerCategory: string;
    headerTitle: string;
    headerSubtitle: string;
  } = route.params as any;
  const { colorMode } = useColorMode();
  const { isOnL1, isOnL2 } = usePlan();
  const { signers } = useSigners();
  const { translations } = useContext(LocalizationContext);
  const [isNfcSupported, setNfcSupport] = useState(true);
  const [signersLoaded, setSignersLoaded] = useState(false);
  const dispatch = useDispatch();
  const sdModal = useAppSelector((state) => state.vault.sdIntroModal);
  const { signer, common } = translations;
  const isMultisig = addSignerFlow ? true : scheme.n !== 1;
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];

  const sortedSigners = {
    [SignerCategory.HARDWARE]: [
      SignerType.BITBOX02,
      SignerType.COLDCARD,
      SignerType.JADE,
      SignerType.KEYSTONE,
      SignerType.LEDGER,
      SignerType.PASSPORT,
      SignerType.PORTAL,
      SignerType.SEEDSIGNER,
      SignerType.SPECTER,
      SignerType.TAPSIGNER,
      SignerType.TREZOR,
    ],
    [SignerCategory.SOFTWARE]: [
      SignerType.KEEPER,
      SignerType.MY_KEEPER,
      SignerType.SEED_WORDS,
      SignerType.OTHER_SD,
    ],
    [SignerCategory.ASSISTED]: [SignerType.POLICY_SERVER],
  };

  const getNfcSupport = async () => {
    const isSupported = await NFC.isNFCSupported();
    setNfcSupport(isSupported);
    setSignersLoaded(true);
  };
  useEffect(() => {
    getNfcSupport();
  }, []);

  function LearnMoreModalContent() {
    return (
      <Box>
        <Box style={styles.alignCenter}>
          <SigningDevicesIllustration />
        </Box>
        <Text color={`${colorMode}.modalGreenContent`} style={styles.modalText}>
          {`${signer.subscriptionTierL1} ${SubscriptionTier.L1} ${signer.subscriptionTierL2} ${SubscriptionTier.L2} ${signer.subscriptionTierL3} ${SubscriptionTier.L3}.\n\n${signer.notSupportedText}`}
        </Text>
      </Box>
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        learnMore
        learnBackgroundColor={`${colorMode}.brownBackground`}
        learnMoreBorderColor={`${colorMode}.brownBackground`}
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
          {!signersLoaded ? (
            <ActivityIndicator />
          ) : (
            <>
              <Box paddingY="4">
                {sortedSigners[signerCategory]?.map((type: SignerType, index: number) => {
                  const { disabled, message: connectivityStatus } = getDeviceStatus(
                    type,
                    isNfcSupported,
                    isOnL1,
                    isOnL2,
                    scheme,
                    signers,
                    addSignerFlow
                  );
                  let message = connectivityStatus;
                  if (!connectivityStatus) {
                    message = getSDMessage({ type });
                  }
                  return (
                    <SigningDeviceCard
                      key={type}
                      type={type}
                      first={index === 0}
                      last={index === sortedSigners[signerCategory].length - 1}
                      isOnL1={isOnL1}
                      isOnL2={isOnL2}
                      addSignerFlow={addSignerFlow}
                      vaultId={vaultId}
                      vaultSigners={vaultSigners}
                      isMultisig={isMultisig}
                      primaryMnemonic={primaryMnemonic}
                      disabled={disabled}
                      message={message}
                    />
                  );
                })}
              </Box>
            </>
          )}
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
        buttonTextColor={`${colorMode}.modalWhiteButtonText`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        secButtonTextColor={`${colorMode}.modalGreenSecButtonText`}
        secondaryCallback={() => {
          dispatch(setSdIntroModal(false));
          dispatch(goToConcierge([ConciergeTag.KEYS], 'signing-device-list'));
        }}
        buttonCallback={() => {
          dispatch(setSdIntroModal(false));
        }}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  modalText: {
    letterSpacing: 0.65,
    fontSize: 14,
    marginTop: 5,
    padding: 1,
  },
  scrollViewWrapper: {
    flex: 1,
    paddingHorizontal: '2.5%',
    paddingTop: '5%',
  },
  scrollViewContainer: {
    flex: 1,
  },
  contentContainerStyle: {
    flexGrow: 1,
  },
  alignCenter: {
    alignSelf: 'center',
  },
});

export default SigningDeviceList;
