/* eslint-disable react/no-unstable-nested-components */
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { KEEPER_KNOWLEDGEBASE } from 'src/core/config';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import KeeperHeader from 'src/components/KeeperHeader';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import NFC from 'src/services/nfc';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import { SignerType } from 'src/core/wallets/enums';
import SigningDevicesIllustration from 'src/assets/images/illustration_SD.svg';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import openLink from 'src/utils/OpenLink';
import { setSdIntroModal } from 'src/store/reducers/vaults';
import usePlan from 'src/hooks/usePlan';
import Note from 'src/components/Note/Note';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getDeviceStatus, getSDMessage } from 'src/hardware';
import { useRoute } from '@react-navigation/native';
import { VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import useSigners from 'src/hooks/useSigners';
import HardwareModalMap, { InteracationMode } from './HardwareModalMap';
import { SDIcons } from './SigningDeviceIcons';

type HWProps = {
  type: SignerType;
  disabled: boolean;
  message: string;
  first?: boolean;
  last?: boolean;
};

function SigningDeviceList() {
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
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { plan } = usePlan();
  const dispatch = useAppDispatch();
  const isOnL1 = plan === SubscriptionTier.L1.toUpperCase();
  const isOnL2 = plan === SubscriptionTier.L2.toUpperCase();

  const sdModal = useAppSelector((state) => state.vault.sdIntroModal);
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const isMultisig = addSignerFlow ? true : scheme.n !== 1;
  const { signers } = useSigners();
  const [isNfcSupported, setNfcSupport] = useState(true);
  const [signersLoaded, setSignersLoaded] = useState(false);

  const { vault } = translations;

  const getNfcSupport = async () => {
    const isSupported = await NFC.isNFCSupported();
    setNfcSupport(isSupported);
    setSignersLoaded(true);
  };

  function VaultSetupContent() {
    return (
      <View>
        <Box alignSelf="center">
          <SigningDevicesIllustration />
        </Box>
        <Text color={`${colorMode}.modalGreenContent`} style={styles.modalText}>
          {`In the ${SubscriptionTier.L1} tier, you can add one signer to activate your vault. This can be upgraded to three signers and five signers on ${SubscriptionTier.L2} and ${SubscriptionTier.L3} tiers\n\nIf a particular signer is not supported, it will be indicated.`}
        </Text>
      </View>
    );
  }

  useEffect(() => {
    getNfcSupport();
  }, []);

  const sortedSigners = [
    SignerType.COLDCARD,
    SignerType.LEDGER,
    SignerType.TREZOR,
    SignerType.TAPSIGNER,
    SignerType.SEEDSIGNER,
    SignerType.BITBOX02,
    SignerType.PASSPORT,
    SignerType.JADE,
    SignerType.KEYSTONE,
    SignerType.SPECTER,
    SignerType.OTHER_SD,
    SignerType.SEED_WORDS,
    // SignerType.MOBILE_KEY,
    SignerType.KEEPER,
    SignerType.POLICY_SERVER,
    SignerType.INHERITANCEKEY,
  ];

  function HardWareWallet({ type, disabled, message, first = false, last = false }: HWProps) {
    const [visible, setVisible] = useState(false);

    const onPress = () => {
      open();
    };

    const open = () => setVisible(true);
    const close = () => setVisible(false);

    return (
      <React.Fragment key={type}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          disabled={disabled}
          style={{
            opacity: disabled ? 0.4 : 1,
          }}
        >
          <Box
            backgroundColor={`${colorMode}.primaryBackground`}
            borderTopRadius={first ? 15 : 0}
            borderBottomRadius={last ? 15 : 0}
          >
            <Box style={styles.walletMapContainer}>
              <Box style={styles.walletMapWrapper}>{SDIcons(type, colorMode === 'dark').Icon}</Box>
              <Box backgroundColor="light.divider" style={styles.divider} />
              <Box style={styles.walletMapLogoWrapper}>
                {SDIcons(type).Logo}
                <Text color="light.inActiveMsg" style={styles.messageText} numberOfLines={2}>
                  {message}
                </Text>
              </Box>
            </Box>
            <Box backgroundColor={`${colorMode}.divider`} style={styles.dividerStyle} />
          </Box>
        </TouchableOpacity>
        <HardwareModalMap
          visible={visible}
          close={close}
          type={type}
          mode={InteracationMode.VAULT_ADDITION}
          isMultisig={isMultisig}
          primaryMnemonic={primaryMnemonic}
          addSignerFlow={addSignerFlow}
          vaultId={vaultId}
          vaultSigners={vaultSigners}
        />
      </React.Fragment>
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={vault.SelectSigner}
        subtitle={vault.SelectSignerSubtitle}
        learnMore
        learnBackgroundColor={`${colorMode}.RussetBrown`}
        learnTextColor={`${colorMode}.white`}
        learnMorePressed={() => {
          dispatch(setSdIntroModal(true));
        }}
      />
      <Box style={styles.scrollViewContainer}>
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          {!signersLoaded ? (
            <ActivityIndicator />
          ) : (
            <Box paddingY="4">
              {sortedSigners?.map((type: SignerType, index: number) => {
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
                  <HardWareWallet
                    key={type}
                    type={type}
                    first={index === 0}
                    last={index === 9}
                    disabled={disabled}
                    message={message}
                  />
                );
              })}
            </Box>
          )}
        </ScrollView>
        <KeeperModal
          visible={sdModal}
          close={() => {
            dispatch(setSdIntroModal(false));
          }}
          title="Signers"
          subTitle="A signer is a hardware or software that stores one of the private keys needed for your vaults"
          modalBackground={`${colorMode}.modalGreenBackground`}
          buttonTextColor={colorMode === 'light' ? `${colorMode}.greenText2` : `${colorMode}.white`}
          buttonBackground={`${colorMode}.modalWhiteButton`}
          buttonText="Add Now"
          buttonCallback={() => {
            dispatch(setSdIntroModal(false));
          }}
          textColor={`${colorMode}.modalGreenContent`}
          Content={VaultSetupContent}
          DarkCloseIcon
          learnMore
          learnMoreCallback={() =>
            openLink(`${KEEPER_KNOWLEDGEBASE}knowledge-base-category/signing-device-usekeeper/`)
          }
        />
      </Box>
      <Box style={styles.noteContainer}>
        <Note
          title="Security Tip"
          subtitle="Devices with Register Vault tag provide additional checks when you are sending funds from your Vault"
          subtitleColor="GreyText"
        />
      </Box>
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
  scrollViewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '2%',
  },
  scrollViewWrapper: {
    height: windowHeight > 800 ? '76%' : '74%',
  },
  contactUsText: {
    fontSize: 12,
    letterSpacing: 0.6,
    width: wp(300),
    lineHeight: 20,
    marginTop: hp(20),
  },
  walletMapContainer: {
    alignItems: 'center',
    minHeight: windowHeight * 0.08,
    flexDirection: 'row',
    paddingLeft: wp(40),
  },
  walletMapWrapper: {
    marginRight: wp(20),
    alignItems: 'center',
    width: wp(15),
  },
  walletMapLogoWrapper: {
    marginLeft: wp(23),
    justifyContent: 'flex-end',
    marginTop: hp(20),
  },
  messageText: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1.3,
    marginTop: hp(5),
    width: windowWidth * 0.6,
  },
  dividerStyle: {
    opacity: 0.1,
    width: windowWidth * 0.8,
    height: 0.5,
  },
  divider: {
    opacity: 0.5,
    height: hp(26),
    width: 1.5,
  },
  italics: {
    fontStyle: 'italic',
  },
  noteContainer: {
    paddingHorizontal: 20,
  },
});
export default SigningDeviceList;
