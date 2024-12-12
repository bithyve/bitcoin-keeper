import { Box, Input, ScrollView, useColorMode } from 'native-base';
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
import IconSettings from 'src/assets/images/settings.svg';
import IconGreySettings from 'src/assets/images/settings_grey.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { hp, wp } from 'src/constants/responsive';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';

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
  const [showAdvancedSettingsModal, setShowAdvancedSettingsModal] = useState(false);
  const [accountNumber, setAccountNumber] = useState(0);
  const [accountNumberText, setAccountNumberText] = useState('');
  const { showToast } = useToastMessage();

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

  const onPressNumber = (digit) => {
    let temp = accountNumberText;
    if (digit !== 'x') {
      temp += digit;
      setAccountNumberText(temp);
    }
    if (accountNumberText && digit === 'x') {
      setAccountNumberText(accountNumberText.slice(0, -1));
    }
  };
  const onDeletePressed = () => {
    setAccountNumberText(accountNumberText.slice(0, accountNumberText.length - 1));
  };

  function AdvancedSettingsContent() {
    return (
      <Box>
        <Text>Account Number (Optional):</Text>
        <Box
          style={styles.input}
          backgroundColor={`${colorMode}.seashellWhite`}
          borderColor={`${colorMode}.greyBorder`}
        >
          <Input
            placeholder="Enter account number (default is 0)"
            placeholderTextColor={`${colorMode}.placeHolderTextColor`}
            borderWidth={0}
            value={accountNumberText}
            onChangeText={setAccountNumberText}
            showSoftInputOnFocus={false}
          />
        </Box>
        <KeyPadView
          onDeletePressed={onDeletePressed}
          onPressNumber={onPressNumber}
          keyColor={`${colorMode}.primaryText`}
        />
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
        rightComponent={
          signerCategory === SignerCategory.HARDWARE && (
            <TouchableOpacity onPress={() => setShowAdvancedSettingsModal(true)}>
              {colorMode === 'light' ? <IconGreySettings /> : <IconSettings />}
            </TouchableOpacity>
          )
        }
        rightComponentPadding={wp(10)}
        rightComponentBottomPadding={hp(40)}
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
                      accountNumber={accountNumber}
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
      <KeeperModal
        visible={showAdvancedSettingsModal}
        title="Advanced Options"
        subTitle="Account numbers are for advanced users. Leave this empty unless you need a specific account."
        close={() => setShowAdvancedSettingsModal(false)}
        buttonText={common.save}
        buttonCallback={() => {
          if (parseInt(accountNumberText).toString() === accountNumberText) {
            setAccountNumber(parseInt(accountNumberText));
            setShowAdvancedSettingsModal(false);
          } else if (!accountNumberText) {
            setAccountNumber(0);
            setShowAdvancedSettingsModal(false);
          } else {
            showToast('Account number invalid', null, IToastCategory.DEFAULT, 3000, true);
          }
        }}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => {
          setAccountNumberText(accountNumber.toString());
          setShowAdvancedSettingsModal(false);
        }}
        Content={AdvancedSettingsContent}
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
  input: {
    marginVertical: hp(15),
    paddingHorizontal: wp(10),
    width: '100%',
    height: hp(50),
    borderRadius: 10,
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export default SigningDeviceList;
