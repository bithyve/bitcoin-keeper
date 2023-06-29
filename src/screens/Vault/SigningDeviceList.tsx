/* eslint-disable react/no-unstable-nested-components */
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import config, { APP_STAGE } from 'src/core/config';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import Alert from 'src/assets/images/alert_illustration.svg';
import HeaderTitle from 'src/components/HeaderTitle';

import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import NFC from 'src/core/services/nfc';

import ScreenWrapper from 'src/components/ScreenWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import { SignerType } from 'src/core/wallets/enums';
import SigningDevicesIllustration from 'src/assets/images/illustration_SD.svg';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import openLink from 'src/utils/OpenLink';
import { setSdIntroModal } from 'src/store/reducers/vaults';
import usePlan from 'src/hooks/usePlan';
import Note from 'src/components/Note/Note';
import { SDIcons } from './SigningDeviceIcons';
import HardwareModalMap from './HardwareModalMap';
import { getSDMessage } from './components/SDMessage';

type HWProps = {
  type: SignerType;
  disabled: boolean;
  message: string;
  first?: boolean;
  last?: boolean;
};
const findKeyInServer = (vaultSigners, type: SignerType) =>
  vaultSigners.find(
    (element) =>
      element.type === type && [SignerType.POLICY_SERVER, SignerType.MOBILE_KEY].includes(type)
  );

const getDisabled = (type: SignerType, isOnL1, vaultSigners) => {
  // Keys Incase of level 1 we have level 1
  if (isOnL1) {
    return { disabled: true, message: 'Upgrade tier to use as key' };
  }
  // Keys Incase of already added
  if (findKeyInServer(vaultSigners, type)) {
    return { disabled: true, message: 'Key already added to the Vault.' };
  }
  return { disabled: false, message: '' };
};

const getDeviceStatus = (
  type: SignerType,
  isNfcSupported,
  vaultSigners,
  isOnL1,
  isOnL2,
  isOnL3
) => {
  switch (type) {
    case SignerType.COLDCARD:
    case SignerType.TAPSIGNER:
      return {
        message: !isNfcSupported ? 'NFC is not supported in your device' : '',
        disabled: config.ENVIRONMENT !== APP_STAGE.DEVELOPMENT && !isNfcSupported,
      };
    case SignerType.MOBILE_KEY:
    case SignerType.POLICY_SERVER:
      return {
        message: getDisabled(type, isOnL1, vaultSigners).message,
        disabled: getDisabled(type, isOnL1, vaultSigners).disabled,
      };
    case SignerType.SEED_WORDS:
    case SignerType.KEEPER:
    case SignerType.TREZOR:
    case SignerType.JADE:
    case SignerType.BITBOX02:
    case SignerType.PASSPORT:
    case SignerType.SEEDSIGNER:
    case SignerType.LEDGER:
    case SignerType.KEYSTONE:
    default:
      return {
        message: '',
        disabled: false,
      };
  }
};

function SigningDeviceList() {
  const { translations } = useContext(LocalizationContext);
  const { plan } = usePlan();
  const dispatch = useAppDispatch();
  const isOnL1 = plan === SubscriptionTier.L1.toUpperCase();
  const isOnL2 = plan === SubscriptionTier.L2.toUpperCase();
  const isOnL3 = plan === SubscriptionTier.L3.toUpperCase();
  const vaultSigners = useAppSelector((state) => state.vault.signers);
  const sdModal = useAppSelector((state) => state.vault.sdIntroModal);

  const [nfcAlert, setNfcAlert] = useState(false);
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
        <Text color="light.white" style={styles.modalText}>
          {`In the ${SubscriptionTier.L1} tier, you can add one signing device to activate your vault. This can be upgraded to three signing devices and five signing devices on ${SubscriptionTier.L2} and ${SubscriptionTier.L3} tiers\n\nIf a particular signing device is not supported, it will be indicated.`}
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
    SignerType.OTHER_SD,
    SignerType.MOBILE_KEY,
    SignerType.POLICY_SERVER,
    SignerType.KEEPER,
    SignerType.SEED_WORDS,
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
            backgroundColor="light.primaryBackground"
            borderTopRadius={first ? 15 : 0}
            borderBottomRadius={last ? 15 : 0}
          >
            <Box style={styles.walletMapContainer}>
              <Box style={styles.walletMapWrapper}>{SDIcons(type).Icon}</Box>
              <Box backgroundColor="light.divider" style={styles.divider} />
              <Box style={styles.walletMapLogoWrapper}>
                {SDIcons(type).Logo}
                <Text color="light.inActiveMsg" style={styles.messageText}>
                  {message}
                </Text>
              </Box>
            </Box>
            <Box backgroundColor="light.divider" style={styles.dividerStyle} />
          </Box>
        </TouchableOpacity>
        <HardwareModalMap visible={visible} close={close} type={type} />
      </React.Fragment>
    );
  }

  const nfcAlertConternt = () => (
    <Box>
      <Box justifyContent="center" alignItems="center">
        <Alert />
      </Box>
      <Text fontSize={13} letterSpacing={0.65} width={wp(260)} color="light.greenText" marginY={4}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
      </Text>
    </Box>
  );

  return (
    <ScreenWrapper>
      <HeaderTitle
        title={vault.SelectSigner}
        subtitle={vault.ForVault}
        headerTitleColor="light.textBlack"
        learnMore
        learnMorePressed={() => {
          dispatch(setSdIntroModal(true));
        }}
        paddingLeft={25}
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
                  vaultSigners,
                  isOnL1,
                  isOnL2,
                  isOnL3
                );
                let message = connectivityStatus;
                if (!connectivityStatus) {
                  message = getSDMessage({ type });
                }
                return (
                  <HardWareWallet
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
          visible={nfcAlert}
          close={() => {
            setNfcAlert(false);
          }}
          title="NFC Not supported"
          subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed "
          buttonText="  CTA  "
          buttonTextColor="light.white"
          textColor="light.primaryText"
          Content={nfcAlertConternt}
        />
        <KeeperModal
          visible={sdModal}
          close={() => {
            dispatch(setSdIntroModal(false));
          }}
          title="Signing Devices"
          subTitle="A signing device is a hardware or software that stores one of the private keys needed for your Vault"
          modalBackground={['light.gradientStart', 'light.gradientEnd']}
          buttonBackground={['#FFFFFF', '#80A8A1']}
          buttonText="Add Now"
          buttonTextColor="light.greenText"
          buttonCallback={() => {
            dispatch(setSdIntroModal(false));
          }}
          textColor="light.white"
          Content={VaultSetupContent}
          DarkCloseIcon
          learnMore
          learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
        />
      </Box>
      <Note
        title="Security Tip"
        subtitle="Please use the Health Check feature to ensure that your device is working and available as expected"
        subtitleColor="GreyText"
        width={windowWidth * 0.8}
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
    fontWeight: '200',
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
export default SigningDeviceList;
