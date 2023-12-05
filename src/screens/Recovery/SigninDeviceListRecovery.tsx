/* eslint-disable react/no-unstable-nested-components */
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import NFC from 'src/services/nfc';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import { SignerType } from 'src/core/wallets/enums';
import { setSdIntroModal } from 'src/store/reducers/vaults';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import HardwareModalMap, { InteracationMode } from '../Vault/HardwareModalMap';
import config, { APP_STAGE, KEEPER_KNOWLEDGEBASE } from 'src/core/config';
import KeeperModal from 'src/components/KeeperModal';
import SigningDevicesIllustration from 'src/assets/images/illustration_SD.svg';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import openLink from 'src/utils/OpenLink';

type HWProps = {
  type: SignerType;
  disabled: boolean;
  message: string;
  first?: boolean;
  last?: boolean;
};

export const getnavigationState = (type) => ({
  index: 5,
  routes: [
    { name: 'NewKeeperApp' },
    { name: 'EnterSeedScreen', params: { isSoftKeyRecovery: false, type } },
    { name: 'OtherRecoveryMethods' },
    { name: 'VaultRecoveryAddSigner' },
    { name: 'SigningDeviceListRecovery' },
    { name: 'EnterSeedScreen', params: { isSoftKeyRecovery: true, type } },
  ],
});

function SigningDeviceListRecovery({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const dispatch = useAppDispatch();
  const { signingDevices } = useAppSelector((state) => state.bhr);
  const { inheritanceRequestId } = useAppSelector((state) => state.storage);
  const sdModal = useAppSelector((state) => state.vault.sdIntroModal);
  const [isNfcSupported, setNfcSupport] = useState(true);
  const [signersLoaded, setSignersLoaded] = useState(false);

  const isMultisig = signingDevices.length >= 1;

  const { vault } = translations;

  const getNfcSupport = async () => {
    const isSupported = await NFC.isNFCSupported();
    setNfcSupport(isSupported);
    setSignersLoaded(true);
  };

  const getDeviceStatus = (
    type: SignerType,
    isNfcSupported,
    signingDevices,
    inheritanceRequestId
  ) => {
    switch (type) {
      case SignerType.COLDCARD:
      case SignerType.TAPSIGNER:
        return {
          message: !isNfcSupported ? 'NFC is not supported in your device' : '',
          disabled: config.ENVIRONMENT !== APP_STAGE.DEVELOPMENT && !isNfcSupported,
        };
      case SignerType.POLICY_SERVER:
        if (signingDevices.length < 2) {
          return {
            message: 'Add two other devices first to recover',
            disabled: true,
          };
        }
        return {
          message: '',
          disabled: false,
        };
      case SignerType.INHERITANCEKEY:
        if (signingDevices.length < 2 || inheritanceRequestId) {
          return {
            message: 'Add two other devices first to recover',
            disabled: true,
          };
        }
        return {
          message: '',
          disabled: false,
        };
      case SignerType.SEED_WORDS:
      case SignerType.MOBILE_KEY:
      case SignerType.KEEPER:
      case SignerType.JADE:
      case SignerType.PASSPORT:
      case SignerType.SEEDSIGNER:
      case SignerType.KEYSTONE:
      case SignerType.LEDGER:
      default:
        return {
          message: '',
          disabled: false,
        };
    }
  };

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
    SignerType.OTHER_SD,
    SignerType.MOBILE_KEY,
    SignerType.POLICY_SERVER,
    SignerType.KEEPER,
    SignerType.SEED_WORDS,
    SignerType.INHERITANCEKEY,
  ];

  function VaultSetupContent() {
    return (
      <Box>
        <Box alignSelf="center">
          <SigningDevicesIllustration />
        </Box>
        <Text color={`${colorMode}.modalGreenContent`} style={styles.modalText}>
          {`In the ${SubscriptionTier.L1} tier, you can add one signing device to activate your vault. This can be upgraded to three signing devices and five signing devices on ${SubscriptionTier.L2} and ${SubscriptionTier.L3} tiers\n\nIf a particular signing device is not supported, it will be indicated.`}
        </Text>
      </Box>
    );
  }

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
                <Text color="light.inActiveMsg" style={styles.messageText}>
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
          mode={InteracationMode.RECOVERY}
          isMultisig={isMultisig}
        />
      </React.Fragment>
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={vault.SelectSigner}
        subtitle={vault.ForVault}
        headerTitleColor={`${colorMode}.black`}
        learnMore
        learnMorePressed={() => {
          dispatch(setSdIntroModal(true));
        }}
        onPressHandler={() =>
          navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
        }
      />
      <Box style={styles.scrollViewContainer}>
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          {!signersLoaded ? (
            <ActivityIndicator />
          ) : (
            <Box paddingY="4">
              {sortedSigners?.map((type: SignerType, index: number) => {
                const { disabled, message } = getDeviceStatus(
                  type,
                  isNfcSupported,
                  signingDevices,
                  inheritanceRequestId
                );
                return (
                  <HardWareWallet
                    key={type}
                    type={type}
                    first={index === 0}
                    last={index === sortedSigners.length - 1}
                    disabled={disabled}
                    message={message}
                  />
                );
              })}
            </Box>
          )}
        </ScrollView>
      </Box>
      <KeeperModal
        visible={sdModal}
        close={() => {
          dispatch(setSdIntroModal(false));
        }}
        title="Signing Devices"
        subTitle="A signing device is a hardware or software that stores one of the private keys needed for your Vault"
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
          openLink(`${KEEPER_KNOWLEDGEBASE}knowledge-base-category/recovery-why-keeper/`)
        }
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
    height: windowHeight * 0.08,
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
});
export default SigningDeviceListRecovery;
