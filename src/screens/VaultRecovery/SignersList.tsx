import { Box, ScrollView, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import SeedWordsIllustration from 'src/assets/images/illustration_seed_words.svg';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import KeeperModal from 'src/components/KeeperModal';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SeedSignerSetupImage from 'src/assets/images/seedsigner_setup.svg';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { captureError } from 'src/services/sentry';
import config, { APP_STAGE } from 'src/core/config';
import { getPassportDetails } from 'src/hardware/passport';
import { getSeedSignerDetails } from 'src/hardware/seedsigner';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { useDispatch } from 'react-redux';
import KeystoneSetupImage from 'src/assets/images/keystone_illustration.svg';
import JadeSVG from 'src/assets/images/illustration_jade.svg';
import { getKeystoneDetails } from 'src/hardware/keystone';
import { getJadeDetails } from 'src/hardware/jade';
import useToastMessage from 'src/hooks/useToastMessage';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { generateSignerFromMetaData, getSignerNameFromType } from 'src/hardware';
import { crossInteractionHandler } from 'src/utils/utilities';
import SigningServer from 'src/services/operations/SigningServer';
import NFC from 'src/services/nfc';
import { useAppSelector } from 'src/store/hooks';
import Clipboard from '@react-native-community/clipboard';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
import LedgerImage from 'src/assets/images/ledger_image.svg';
import TickIcon from 'src/assets/images/icon_tick.svg';
import BitoxImage from 'src/assets/images/bitboxSetup.svg';
import TrezorSetup from 'src/assets/images/trezor_setup.svg';
import InheritanceKeyServer from 'src/services/operations/InheritanceKey';
import { generateKey } from 'src/services/operations/encryption';
import { setInheritanceRequestId } from 'src/store/reducers/storage';
import { close } from '@sentry/react-native';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import { KeeperContent } from '../SignTransaction/SignerModals';
import { formatDuration } from './VaultRecovery';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { generateCosignerMapIds } from 'src/core/wallets/factories/VaultFactory';

const getnavigationState = (type) => ({
  index: 5,
  routes: [
    { name: 'NewKeeperApp' },
    { name: 'EnterSeedScreen', params: { isSoftKeyRecovery: false, type } },
    { name: 'OtherRecoveryMethods' },
    { name: 'VaultRecoveryAddSigner' },
    { name: 'SignersList' },
    { name: 'EnterSeedScreen', params: { isSoftKeyRecovery: true, type } },
  ],
});

export const getDeviceStatus = (
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

function LedgerSetupContent() {
  return (
    <Box alignItems="center">
      <LedgerImage />
      <Box marginTop={2}>
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{ paddingVertical: 5 }}
        >
          {`\u2022 Please visit ${config.KEEPER_HWI} using Chrome browser on your desktop to use the Keeper Hardware Interface to connect with Ledger.`}
        </Text>
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{ paddingVertical: 5 }}
        >
          {`\u2022 The Keeper Harware Interface will exchange the device details from/to the Keeper app and the signing device.`}
        </Text>
      </Box>
    </Box>
  );
}
function ColdCardSetupContent() {
  return (
    <View justifyContent="flex-start" width={wp(300)}>
      <Box ml={wp(21)}>
        <ColdCardSetupImage />
      </Box>
      <Box marginTop="4" alignItems="flex-start">
        <Text color="light.greenText" fontSize={13} letterSpacing={0.65}>
          {`Export the xPub by going to Advanced/Tools > Export wallet > Generic JSON. From here choose the account number and transfer over NFC. Make sure you remember the account you had chosen (This is important for recovering your Vault)`}
        </Text>
      </Box>
    </View>
  );
}

function PassportSetupContent() {
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
          {`\u2022 Make sure you enable Testnet mode on the SeedSigner if you are running the app in the Testnet mode from Settings > Advanced > Bitcoin network > Testnet and enable it`}
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
      </Box>
    </View>
  );
}

function BitBox02Content() {
  return (
    <Box alignItems="center">
      <BitoxImage />
      <Box marginTop={2}>
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{ paddingVertical: 5 }}
        >
          {`\u2022 Please visit ${config.KEEPER_HWI} using Chrome browser on your desktop to use the Keeper Hardware Interface to connect with BitBox02.`}
        </Text>
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{ paddingVertical: 5 }}
        >
          {`\u2022 The Keeper Harware Interface will exchange the device details from/to the Keeper app and the signing device.`}
        </Text>
      </Box>
    </Box>
  );
}

function TrezorContent() {
  return (
    <Box alignItems="center">
      <TrezorSetup />
      <Box marginTop={2}>
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{ paddingVertical: 5 }}
        >
          {`\u2022 Please visit ${config.KEEPER_HWI} using Chrome browser on your desktop to use the Keeper Hardware Interface to connect with Trezor.`}
        </Text>
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{ paddingVertical: 5 }}
        >
          {`\u2022 The Keeper Harware Interface will exchange the device details from/to the Keeper app and the signing device.`}
        </Text>
      </Box>
    </Box>
  );
}

function SignersList({ navigation }) {
  type HWProps = {
    disabled: boolean;
    message: string;
    type: SignerType;
    first?: boolean;
    last?: boolean;
  };
  const { signingDevices, relayVaultReoveryShellId } = useAppSelector((state) => state.bhr);
  const [isNfcSupported, setNfcSupport] = useState(true);

  const getNfcSupport = async () => {
    const isSupported = await NFC.isNFCSupported();
    setNfcSupport(isSupported);
  };

  useEffect(() => {
    getNfcSupport();
  }, []);

  const { navigate } = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslation } = translations;

  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const verifyPassport = async (qrData, resetQR) => {
    try {
      const { xpub, derivationPath, xfp } = getPassportDetails(qrData);
      const passport: VaultSigner = generateSignerFromMetaData({
        xpub,
        derivationPath,
        xfp,
        signerType: SignerType.PASSPORT,
        storageType: SignerStorage.COLD,
        isMultisig: signingDevices.length > 1,
      });
      dispatch(setSigningDevices(passport));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      resetQR();
      showToast('Invalid QR, please scan the QR from Passport!');
      navigation.dispatch(CommonActions.navigate('SignersList'));
      captureError(err);
    }
  };

  const otpContent = () => {
    const [otp, setOtp] = useState('');
    const onPressNumber = (text) => {
      let tmpPasscode = otp;
      if (otp.length < 6) {
        if (text !== 'x') {
          tmpPasscode += text;
          setOtp(tmpPasscode);
        }
      }
      if (otp && text === 'x') {
        setOtp(otp.slice(0, -1));
      }
    };

    const onDeletePressed = () => {
      setOtp(otp.slice(0, otp.length - 1));
    };

    return (
      <Box width={hp(300)}>
        <Box>
          <TouchableOpacity
            onPress={async () => {
              const clipBoardData = await Clipboard.getString();
              if (clipBoardData.match(/^\d{6}$/)) {
                setOtp(clipBoardData);
              } else {
                showToast('Invalid OTP');
              }
            }}
          >
            <CVVInputsView passCode={otp} passcodeFlag={false} backgroundColor textColor />
          </TouchableOpacity>
          <Text
            fontSize={13}
            letterSpacing={0.65}
            width={wp(290)}
            color="light.greenText"
            marginTop={2}
          >
            {vaultTranslation.cvvSigningServerInfo}
          </Text>
          <Box mt={10} alignSelf="flex-end" mr={2}>
            <Box>
              <CustomGreenButton
                onPress={() => {
                  verifySigningServer(otp);
                }}
                value="Confirm"
              />
            </Box>
          </Box>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor="light.primaryText"
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    );
  };

  const verifySeedSigner = async (qrData, resetQR) => {
    try {
      const { xpub, derivationPath, xfp } = getSeedSignerDetails(qrData);
      const seedSigner: VaultSigner = generateSignerFromMetaData({
        xpub,
        derivationPath,
        xfp,
        signerType: SignerType.SEEDSIGNER,
        storageType: SignerStorage.COLD,
        isMultisig: signingDevices.length > 1,
      });
      dispatch(setSigningDevices(seedSigner));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      resetQR();
      showToast('Invalid QR, please scan the QR from SeedSigner!');
      navigation.dispatch(CommonActions.navigate('SignersList'));
      captureError(err);
    }
  };

  const verifyKeystone = async (qrData, resetQR) => {
    try {
      const { xpub, derivationPath, xfp } = getKeystoneDetails(qrData);
      const keystone: VaultSigner = generateSignerFromMetaData({
        xpub,
        derivationPath,
        xfp,
        signerType: SignerType.KEYSTONE,
        storageType: SignerStorage.COLD,
        isMultisig: signingDevices.length > 1,
      });
      dispatch(setSigningDevices(keystone));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      resetQR();
      showToast('Invalid QR, please scan the QR from Keystone!');
      navigation.dispatch(CommonActions.navigate('SignersList'));
      captureError(err);
    }
  };

  const verifyJade = async (qrData, resetQR) => {
    try {
      const { xpub, derivationPath, xfp } = getJadeDetails(qrData);
      const jade: VaultSigner = generateSignerFromMetaData({
        xpub,
        derivationPath,
        xfp,
        signerType: SignerType.JADE,
        storageType: SignerStorage.COLD,
        isMultisig: signingDevices.length > 1,
      });
      dispatch(setSigningDevices(jade));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      resetQR();
      showToast('Invalid QR, please scan the QR from Jade!');
      navigation.dispatch(CommonActions.navigate('SignersList'));
      captureError(err);
    }
  };

  const verifyKeeperSigner = (qrData, resetQR) => {
    try {
      const { mfp, xpub, derivationPath } = JSON.parse(qrData);
      const ksd = generateSignerFromMetaData({
        xpub,
        derivationPath,
        xfp: mfp,
        signerType: SignerType.KEEPER,
        storageType: SignerStorage.WARM,
        isMultisig: true,
      });
      dispatch(setSigningDevices(ksd));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      resetQR();
      const message = crossInteractionHandler(err);
      throw new Error(message);
    }
  };

  const verifySigningServer = async (otp) => {
    try {
      if (signingDevices.length <= 1) throw new Error('Add two other devices first to recover');
      const cosignersMapIds = generateCosignerMapIds(signingDevices, SignerType.POLICY_SERVER);
      const response = await SigningServer.fetchSignerSetupViaCosigners(cosignersMapIds[0], otp);
      if (response.xpub) {
        const signingServerKey = generateSignerFromMetaData({
          xpub: response.xpub,
          derivationPath: response.derivationPath,
          xfp: response.masterFingerprint,
          signerType: SignerType.POLICY_SERVER,
          storageType: SignerStorage.WARM,
          isMultisig: true,
          signerId: response.id,
          signerPolicy: response.policy,
        });

        dispatch(setSigningDevices(signingServerKey));
        navigation.dispatch(CommonActions.navigate('VaultRecoveryAddSigner'));
        showToast(`${signingServerKey.signerName} added successfully`, <TickIcon />);
      }
    } catch (err) {
      Alert.alert(`${err}`);
    }
  };

  const requestInheritanceKey = async (signers: VaultSigner[]) => {
    try {
      if (signers.length <= 1) throw new Error('Add two other devices first to recover');
      const cosignersMapIds = generateCosignerMapIds(signingDevices, SignerType.INHERITANCEKEY);

      const requestId = `request-${generateKey(10)}`;
      const thresholdDescriptors = signers.map((signer) => signer.signerId);

      const { requestStatus } = await InheritanceKeyServer.requestInheritanceKey(
        requestId,
        cosignersMapIds[0],
        thresholdDescriptors
      );

      showToast(
        `Request would approve in ${formatDuration(requestStatus.approvesIn)} if not rejected`,
        <TickIcon />
      );
      dispatch(setInheritanceRequestId(requestId));
      navigation.dispatch(CommonActions.navigate('VaultRecoveryAddSigner'));
    } catch (err) {
      showToast(`${err}`, <ToastErrorIcon />);
    }
    close();
  };

  function HardWareWallet({ disabled, message, type, first = false, last = false }: HWProps) {
    const [visible, setVisible] = useState(false);
    const { signingDevices } = useAppSelector((state) => state.bhr);

    const onPress = () => {
      open();
    };

    const open = () => setVisible(true);
    const close = () => setVisible(false);

    const onQRScan = (qrData, resetQR) => {
      switch (type as SignerType) {
        case SignerType.PASSPORT:
          return verifyPassport(qrData, resetQR);
        case SignerType.SEEDSIGNER:
          return verifySeedSigner(qrData, resetQR);
        case SignerType.KEYSTONE:
          return verifyKeystone(qrData, resetQR);
        case SignerType.JADE:
          return verifyJade(qrData, resetQR);
        case SignerType.KEEPER:
          return verifyKeeperSigner(qrData, resetQR);
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
            type,
          },
        })
      );
    };

    const navigateToVerifyWithChannel = () => {
      setVisible(false);
      navigation.dispatch(
        CommonActions.navigate({
          name: 'ConnectChannelRecovery',
          params: {
            title: `Setting up ${getSignerNameFromType(type)}`,
            subtitle: `Please visit ${config.KEEPER_HWI} on your Chrome browser to use the Keeper Hardware Interface to setup`,
            type,
          },
        })
      );
    };

    return (
      <>
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
          visible={visible && type === SignerType.LEDGER}
          close={close}
          title="Verify Ledger"
          subTitle="Keep your Ledger ready"
          buttonText="Proceed"
          buttonTextColor="light.white"
          buttonCallback={navigateToVerifyWithChannel}
          textColor="light.primaryText"
          Content={LedgerSetupContent}
        />
        <KeeperModal
          visible={visible && type === SignerType.PASSPORT}
          close={close}
          title="Verify Passport (Batch 2)"
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
          title="Verify SeedSigner"
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
          title="Verify  up Keystone"
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
          title="Verify  up Blockstream Jade"
          subTitle="Keep your Jade ready and unlocked before proceeding"
          subTitleColor="light.secondaryText"
          buttonText="Continue"
          buttonTextColor="light.white"
          buttonCallback={navigateToAddQrBasedSigner}
          textColor="light.primaryText"
          Content={JadeSetupContent}
        />

        <KeeperModal
          visible={visible && type === SignerType.KEEPER}
          close={close}
          title="Keep your Device Ready"
          subTitle="Keep your Keeper Signing Device ready before proceeding"
          subTitleColor="light.secondaryText"
          Content={() => <KeeperContent />}
          buttonText="Continue"
          buttonTextColor="light.white"
          buttonCallback={navigateToAddQrBasedSigner}
          textColor="light.primaryText"
        />
        <KeeperModal
          visible={visible && type === SignerType.SEED_WORDS}
          close={close}
          title="Recover through Seed Key"
          subTitle="Keep your 12 words reocvery phrase handy"
          subTitleColor="light.secondaryText"
          Content={() => <SeedWordsIllustration />}
          buttonText="Continue"
          buttonTextColor="light.white"
          buttonCallback={() => {
            const navigationState = getnavigationState(SignerType.SEED_WORDS);
            navigation.dispatch(CommonActions.reset(navigationState));
            close();
          }}
          textColor="light.primaryText"
        />
        <KeeperModal
          visible={visible && type === SignerType.MOBILE_KEY}
          close={close}
          title="Recover using Mobile Key (Seed)"
          subTitle="Keep your 12 words reocvery phrase handy"
          subTitleColor="light.secondaryText"
          Content={() => <SeedWordsIllustration />}
          buttonText="Continue"
          buttonTextColor="light.white"
          buttonCallback={() => {
            const navigationState = getnavigationState(SignerType.MOBILE_KEY);
            navigation.dispatch(CommonActions.reset(navigationState));
            close();
          }}
          textColor="light.primaryText"
        />
        <KeeperModal
          visible={visible && type === SignerType.POLICY_SERVER}
          close={close}
          title="Confirm OTP to setup 2FA"
          subTitle="To complete setting up the signing server"
          subTitleColor="light.secondaryText"
          textColor="light.primaryText"
          Content={otpContent}
        />
        <KeeperModal
          visible={visible && type === SignerType.INHERITANCEKEY}
          close={close}
          title="Recover using Inheritance Key"
          subTitle="Requesting for the inheritance key"
          subTitleColor="light.secondaryText"
          Content={() => <SeedWordsIllustration />}
          buttonText="Continue"
          buttonTextColor="light.white"
          buttonCallback={() => {
            requestInheritanceKey(signingDevices);
          }}
          textColor="light.primaryText"
        />
        <KeeperModal
          visible={visible && type === SignerType.BITBOX02}
          close={close}
          title="Keep BitBox02 Ready"
          subTitle={`Please visit ${config.KEEPER_HWI} on your Chrome browser to use the Keeper Hardware Interface to connect with BitBox02.`}
          subTitleColor="light.secondaryText"
          textColor="light.primaryText"
          Content={() => <BitBox02Content />}
          buttonText="Continue"
          buttonCallback={navigateToVerifyWithChannel}
        />
        <KeeperModal
          visible={visible && type === SignerType.TREZOR}
          close={close}
          title="Keep Trezor Ready"
          subTitle={`Please visit ${config.KEEPER_HWI} on your Chrome browser to use the Keeper Hardware Interface to connect with Trezor.`}
          subTitleColor="light.secondaryText"
          textColor="light.primaryText"
          Content={() => <TrezorContent />}
          buttonText="Continue"
          buttonCallback={navigateToVerifyWithChannel}
        />
      </>
    );
  }

  const { inheritanceRequestId } = useAppSelector((state) => state.storage);

  return (
    <ScreenWrapper>
      <KeeperHeader
        title="Select Signing Device"
        subtitle="To recover your Vault"
        onPressHandler={() =>
          navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' })
        }
      />
      <ScrollView style={{ height: hp(520) }} showsVerticalScrollIndicator={false}>
        <Box paddingY="4">
          {[
            SignerType.TAPSIGNER,
            SignerType.COLDCARD,
            SignerType.SEEDSIGNER,
            SignerType.PASSPORT,
            SignerType.JADE,
            SignerType.BITBOX02,
            SignerType.TREZOR,
            SignerType.KEYSTONE,
            SignerType.LEDGER,
            SignerType.KEEPER,
            SignerType.SEED_WORDS,
            SignerType.MOBILE_KEY,
            SignerType.POLICY_SERVER,
            SignerType.INHERITANCEKEY,
          ].map((type: SignerType, index: number) => {
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
                last={index === 3}
                disabled={disabled}
                message={message}
              />
            );
          })}
        </Box>
      </ScrollView>
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
  },
  scrollViewWrapper: {
    height: windowHeight > 800 ? '90%' : '85%',
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

export default SignersList;
