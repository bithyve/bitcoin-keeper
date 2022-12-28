import { Box, ScrollView, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';

import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import KeeperModal from 'src/components/KeeperModal';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SeedSignerSetupImage from 'src/assets/images/seedsigner_setup.svg';
import { SignerType } from 'src/core/wallets/enums';
import { SigningDeviceRecovery } from 'src/common/data/enums/BHR';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import { Alert, TouchableOpacity } from 'react-native';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { captureError } from 'src/core/services/sentry';
import config from 'src/core/config';
import { getPassportDetails } from 'src/hardware/passport';
import { getSeedSignerDetails } from 'src/hardware/seedsigner';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { useDispatch } from 'react-redux';
import KeystoneSetupImage from 'src/assets/images/keystone_illustration.svg';
import JadeSVG from 'src/assets/images/illustration_jade.svg';
import { getKeystoneDetails } from 'src/hardware/keystone';
import { generateSignerFromMetaData } from 'src/hardware';
import { getJadeDetails } from 'src/hardware/jade';
import { WalletMap } from '../Vault/WalletMap';

function TapsignerSetupContent() {
  return (
    <View>
      <TapsignerSetupImage />
      <Box marginTop="4">
        <Text color="light.greenText" fontSize={13} light padding={1}>
          {`\u2022 You will need the Pin/CVC at the back of TAPSIGNER`}
        </Text>
        <Text color="light.greenText" fontSize={13} light padding={1}>
          {'\u2022 Make sure that TAPSIGNER is not used as a Signer on other apps'}
        </Text>
      </Box>
    </View>
  );
}

function ColdCardSetupContent() {
  return (
    <View justifyContent="flex-start" width={wp(300)}>
      <Box ml={wp(21)}>
        <ColdCardSetupImage />
      </Box>
      <Box marginTop="4" alignItems="flex-start">
        <Box flex={1} flexDirection="row" alignItems="space-between" justifyContent="center">
          <Box mb={hp(19)} mx={wp(10)} flexDirection="row">
            <Text color="light.greenText" fontSize={13} light ml={3}>
              {`\u2022 Export the xPub by going to Settings > Multisig wallet > Export xPub. From here choose the NFC option to make the transfer and remember the account you had chosen (This is important for recovering your vault).\n`}
            </Text>
          </Box>
        </Box>
        <Box flex={1} flexDirection="row" alignItems="space-between" justifyContent="center">
          <Box mb={hp(19)} mx={wp(10)} flexDirection="row">
            <Text color="light.greenText" fontSize={13} light ml={3}>
              {`\u2022 Make sure you enable Testnet mode on the coldcard if you are running the app in the Testnet more from Advance option > Danger Zone > Testnet and enable it`}
            </Text>
          </Box>
        </Box>
      </Box>
    </View>
  );
}

function PassportSetupContent() {
  return (
    <View>
      <Box ml={wp(21)}>
        <ColdCardSetupImage />
      </Box>
      <Box marginTop="4">
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Export the xPub from the Account section > Manage Account > Connect Wallet > Keeper > Multisig > QR Code.\n`}
        </Text>
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Make sure you enable Testnet mode on the Passport if you are running the app in the Testnet mode from Settings > Bitcoin > Network > Testnet and enable it`}
        </Text>
      </Box>
    </View>
  );
}

function SeedSignerSetupContent() {
  return (
    <View>
      <Box ml={wp(21)}>
        <SeedSignerSetupImage />
      </Box>
      <Box marginTop="4">
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Make sure the seed is loaded and export the xPub by going to Seeds > Select your master fingerprint > Export Xpub > Multisig > Nested Segwit > Keeper.\n`}
        </Text>
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Make sure you enable Testnet mode on the SeedSigner if you are running the app in the Testnet mode from Settings > Adavnced > Bitcoin network > Testnet and enable it`}
        </Text>
      </Box>
    </View>
  );
}

function KeystoneSetupContent() {
  return (
    <View>
      <Box ml={wp(21)}>
        <KeystoneSetupImage />
      </Box>
      <Box marginTop="4">
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Make sure the BTC-only firmware is installed and export the xPub by going to the Side Menu > Multisig Wallet > Extended menu (three dots) from the top right corner > Show/Export XPUB > Nested SegWit.\n`}
        </Text>
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Make sure you enable Testnet mode on the Keystone if you are running the app in the Testnet mode from  Side Menu > Settings > Blockchain > Testnet and confirm`}
        </Text>
      </Box>
    </View>
  );
}

function JadeSetupContent() {
  return (
    <View>
      <Box ml={wp(21)}>
        <JadeSVG />
      </Box>
      <Box marginTop="4">
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Make sure the Jade is setup with a companion app and Unlocked. Then export the xPub by going to Settings > Xpub Export. Also to be sure that the wallet type and script type is set to Multisig and Native Segwit in the options section.\n`}
        </Text>
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Make sure you enable Testnet mode on the Jade by creating a multisig wallet with the companion app if you are running the app in the Testnet mode.`}
        </Text>
      </Box>
    </View>
  );
}

function SignersList() {
  type HWProps = {
    type: SignerType;
    first?: boolean;
    last?: boolean;
  };

  const { navigate } = useNavigation();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const verifyPassport = async (qrData) => {
    try {
      const { xpub } = getPassportDetails(qrData);
      const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
      const sigingDeivceDetails: SigningDeviceRecovery = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        xpub,
        type: SignerType.PASSPORT,
      };
      dispatch(setSigningDevices(sigingDeivceDetails));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      Alert.alert('Invalid QR, please scan the QR from Passport!');
      navigation.dispatch(CommonActions.navigate('SignersList'));
      captureError(err);
    }
  };

  const verifySeedSigner = async (qrData) => {
    try {
      const { xpub } = getSeedSignerDetails(qrData);
      const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
      const sigingDeivceDetails: SigningDeviceRecovery = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        xpub,
        type: SignerType.SEEDSIGNER,
      };
      dispatch(setSigningDevices(sigingDeivceDetails));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      Alert.alert('Invalid QR, please scan the QR from SeedSigner!');
      navigation.dispatch(CommonActions.navigate('SignersList'));
      captureError(err);
    }
  };

  const verifyKeystone = async (qrData) => {
    try {
      const { xpub, derivationPath, xfp } = getKeystoneDetails(qrData);
      const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
      const sigingDeivceDetails: SigningDeviceRecovery = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        xpub,
        type: SignerType.KEYSTONE,
      };
      dispatch(setSigningDevices(sigingDeivceDetails));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      Alert.alert('Invalid QR, please scan the QR from Keystone!');
      navigation.dispatch(CommonActions.navigate('SignersList'));
      captureError(err);
    }
  };

  const verifyJade = async (qrData) => {
    try {
      const { xpub, derivationPath, xfp } = getJadeDetails(qrData);
      const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
      const sigingDeivceDetails: SigningDeviceRecovery = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        xpub,
        type: SignerType.JADE,
      };
      dispatch(setSigningDevices(sigingDeivceDetails));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      Alert.alert('Invalid QR, please scan the QR from Jade!');
      navigation.dispatch(CommonActions.navigate('SignersList'));
      captureError(err);
    }
  };

  function HardWareWallet({ type, first = false, last = false }: HWProps) {
    const [visible, setVisible] = useState(false);
    const onPress = () => {
      open();
    };

    const open = () => setVisible(true);
    const close = () => setVisible(false);

    const onQRScan = (qrData) => {
      switch (type as SignerType) {
        case SignerType.PASSPORT:
          return verifyPassport(qrData);
        case SignerType.SEEDSIGNER:
          return verifySeedSigner(qrData);
        case SignerType.KEYSTONE:
          return verifyKeystone(qrData);
        case SignerType.JADE:
          return verifyJade(qrData);
        default:
      }
    };

    const navigateToAddQrBasedSigner = () => {
      close();
      navigation.dispatch(
        CommonActions.navigate({
          name: 'QrRecovery',
          params: {
            title: `Setting up ${type}`,
            subtitle: 'Please scan until all the QR data has been retrieved',
            onQrScan: onQRScan,
          },
        })
      );
    };

    return (
      <>
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
          <Box
            backgroundColor="light.primaryBackground"
            borderTopRadius={first ? 15 : 0}
            borderBottomRadius={last ? 15 : 0}
          >
            <Box
              alignItems="center"
              height={windowHeight * 0.08}
              flexDirection="row"
              style={{
                paddingVertical: hp(25),
                paddingLeft: wp(40),
              }}
            >
              <Box
                style={{
                  marginRight: wp(20),
                  width: wp(15),
                }}
              >
                {WalletMap(type).Icon}
              </Box>
              <Box opacity={0.3} backgroundColor="light.divider" height={hp(24)} width={0.5} />
              <Box
                style={{
                  marginLeft: wp(23),
                }}
              >
                {WalletMap(type).Logo}
              </Box>
            </Box>
            <Box
              opacity={0.1}
              backgroundColor="light.divider"
              width={windowWidth * 0.8}
              height={0.5}
            />
          </Box>
        </TouchableOpacity>
        <KeeperModal
          visible={visible && type === SignerType.TAPSIGNER}
          close={close}
          title="Verify TAPSIGNER"
          subTitle="Keep your TAPSIGNER ready"
          buttonText="Verify"
          buttonTextColor="light.white"
          buttonCallback={() => {
            navigate('TapSignerRecovery');
            close();
          }}
          textColor="light.primaryText"
          Content={TapsignerSetupContent}
        />
        <KeeperModal
          visible={visible && type === SignerType.COLDCARD}
          close={close}
          title="Verify Coldcard"
          subTitle="Keep your Coldcard ready"
          buttonText="Proceed"
          buttonTextColor="light.white"
          buttonCallback={() => {
            navigate('ColdCardReocvery');
            close();
          }}
          textColor="light.primaryText"
          Content={ColdCardSetupContent}
        />
        <KeeperModal
          visible={visible && type === SignerType.PASSPORT}
          close={close}
          title="Setting up Passport (Batch 2)"
          subTitle="Keep your Foundation Passport (Batch 2) ready before proceeding"
          subTitleColor="light.secondaryText"
          buttonText="Continue"
          buttonTextColor="light.white"
          buttonCallback={navigateToAddQrBasedSigner}
          textColor="light.primaryText"
          Content={PassportSetupContent}
        />
        <KeeperModal
          visible={visible && type === SignerType.SEEDSIGNER}
          close={close}
          title="Setting up SeedSigner"
          subTitle="Keep your SeedSigner ready and powered before proceeding"
          subTitleColor="light.secondaryText"
          buttonText="Continue"
          buttonTextColor="light.white"
          buttonCallback={navigateToAddQrBasedSigner}
          textColor="light.primaryText"
          Content={SeedSignerSetupContent}
        />
        <KeeperModal
          visible={visible && type === SignerType.KEYSTONE}
          close={close}
          title="Setting up Keystone"
          subTitle="Keep your Keystone ready before proceeding"
          subTitleColor="light.secondaryText"
          buttonText="Continue"
          buttonTextColor="light.white"
          buttonCallback={navigateToAddQrBasedSigner}
          textColor="light.primaryText"
          Content={KeystoneSetupContent}
        />
        <KeeperModal
          visible={visible && type === SignerType.JADE}
          close={close}
          title="Setting up Blockstream Jade"
          subTitle="Keep your Jade ready and unlocked before proceeding"
          subTitleColor="light.secondaryText"
          buttonText="Continue"
          buttonTextColor="light.white"
          buttonCallback={navigateToAddQrBasedSigner}
          textColor="light.primaryText"
          Content={JadeSetupContent}
        />
      </>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Select Signing Device"
        subtitle="To recover your vault"
        headerTitleColor="light.textBlack"
        paddingTop={hp(5)}
      />
      <ScrollView style={{ height: hp(520) }} showsVerticalScrollIndicator={false}>
        <Box paddingY="4">
          {[
            SignerType.TAPSIGNER,
            SignerType.COLDCARD,
            SignerType.SEEDSIGNER,
            SignerType.PASSPORT,
            SignerType.JADE,
            SignerType.KEYSTONE,
          ].map((type: SignerType, index: number) => (
            <HardWareWallet type={type} first={index === 0} last={index === 3} />
          ))}
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

export default SignersList;
