import React, { useContext, useState } from 'react';
import * as bip39 from 'bip39';
import { Alert, StyleSheet } from 'react-native';
import { Box, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { generateMobileKey, generateSeedWordsKey } from 'src/core/wallets/factories/VaultFactory';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import TickIcon from 'src/assets/images/icon_tick.svg';
import Text from 'src/components/KeeperText';

import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import DeleteIcon from 'src/assets/icons/deleteBlack.svg';
import JadeSVG from 'src/assets/images/illustration_jade.svg';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import KeystoneSetupImage from 'src/assets/images/keystone_illustration.svg';
import LedgerImage from 'src/assets/images/ledger_image.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import MobileKeyIllustration from 'src/assets/images/mobileKey_illustration.svg';
import PassportSVG from 'src/assets/images/illustration_passport.svg';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import SeedSignerSetupImage from 'src/assets/images/seedsigner_setup.svg';
import KeeperSetupImage from 'src/assets/images/illustration_ksd.svg';
import SeedWordsIllustration from 'src/assets/images/illustration_seed_words.svg';
import SigningServerIllustration from 'src/assets/images/signingServer_illustration.svg';
import SuccessIllustration from 'src/assets/images/success_illustration.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/core/services/sentry';
import config from 'src/core/config';
import { generateSignerFromMetaData, getSignerNameFromType } from 'src/hardware';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getJadeDetails } from 'src/hardware/jade';
import { getKeystoneDetails } from 'src/hardware/keystone';
import { getPassportDetails } from 'src/hardware/passport';
import { getSeedSignerDetails } from 'src/hardware/seedsigner';
import { hash512 } from 'src/core/services/operations/encryption';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import usePlan from 'src/hooks/usePlan';
import useToastMessage from 'src/hooks/useToastMessage';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import HWError from 'src/hardware/HWErrorState';
import { HWErrorType } from 'src/common/data/enums/Hardware';
import ReactNativeBiometrics from 'react-native-biometrics';
import * as SecureStore from '../../storage/secure-store';

const RNBiometrics = new ReactNativeBiometrics();

function SetupSuccessfully() {
  return (
    <Box width={wp(270)}>
      <Box alignItems="center">
        <SuccessIllustration />
      </Box>
      <Box marginTop={hp(0)}>
        <Text color="light.greenText" fontSize={13} padding={1} letterSpacing={0.65}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        </Text>
      </Box>
    </Box>
  );
}

export function BulletPoint({ text }) {
  return (
    <Box style={styles.bulletContainer}>
      <Box backgroundColor="light.greenText" style={styles.bulletPoint} />
      <Text color="light.greenText" style={styles.bullerPointText}>
        {text}
      </Text>
    </Box>
  );
}

function TapsignerSetupContent() {
  return (
    <View>
      <TapsignerSetupImage />
      <BulletPoint text="You will need the Pin/CVC at the back of TAPSIGNER" />
      <BulletPoint text="You should generally not use the same signing device on multiple wallets/apps" />
    </View>
  );
}

function ColdCardSetupContent({ isMultisig }: { isMultisig: boolean }) {
  const userInstruction = isMultisig
    ? `Export the xPub by going to Settings > Multisig wallet > Export xPub. From here choose the NFC option to make the transfer and remember the account you had chosen (This is important for recovering your vault).\n`
    : `Export the xPub by going to Advanced/Tools > Export wallet > Generic JSON. From here choose the account number and transfer over NFC. Make sure you remember the account you had chosen (This is important for recovering your vault).\n`;
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
          {`\u2022 ${userInstruction}`}
        </Text>
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Make sure you enable Testnet mode on the coldcard if you are running the app in the Testnet more from Advance option > Danger Zone > Testnet and enable it`}
        </Text>
      </Box>
    </View>
  );
}
function LedgerSetupContent({ isMultisig }: { isMultisig: boolean }) {
  return (
    <View>
      <Box ml={wp(21)}>
        <LedgerImage />
      </Box>
      <Box marginTop="4" flex={1} alignItems="center" justifyContent="center">
        <Box flex={1} flexDirection="row" alignItems="space-between" justifyContent="center">
          <Text color="light.greenText" fontSize={13} light>
            {`\u2022 Please make sure you have the BTC or BTC Testnet app downloaded on the Ledger based on the your current BTC network`}
          </Text>
        </Box>
        <Box flex={1} flexDirection="row" alignItems="space-between" justifyContent="center">
          <Text color="light.greenText" fontSize={13} light>
            {`\u2022 Proceed once you are on the app on the Nano X. Keeper will scan for your hardware and fetch the xPub`}
          </Text>
        </Box>
      </Box>
    </View>
  );
}

function PassportSetupContent({ isMultisig }: { isMultisig: boolean }) {
  const instructions = `\u2022 Export the xPub from the Account section > Manage Account > Connect Wallet > Keeper > ${
    isMultisig ? 'Multisig' : 'Singlesig'
  } > QR Code.\n`;
  return (
    <View>
      <Box ml={wp(21)}>
        <PassportSVG />
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
          {instructions}
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

function SeedSignerSetupContent({ isMultisig }: { isMultisig: boolean }) {
  const instructions = `\u2022 Make sure the seed is loaded and export the xPub by going to Seeds > Select your master fingerprint > Export Xpub > ${
    isMultisig ? 'Multisig' : 'Singlesig'
  } > Native Segwit > Keeper.\n`;
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
          {instructions}
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

function KeystoneSetupContent({ isMultisig }: { isMultisig: boolean }) {
  const instructions = isMultisig
    ? `\u2022 Make sure the BTC-only firmware is installed and export the xPub by going to the Side Menu > Multisig Wallet > Extended menu (three dots) from the top right corner > Show/Export XPUB > Nested SegWit.\n`
    : `\u2022 Make sure the BTC-only firmware is installed and export the xPub by going to the extended menu (three dots) in the Generic Wallet section > Export Wallet`;
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
          {instructions}
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

function JadeSetupContent({ isMultisig }: { isMultisig: boolean }) {
  const instructions = `\u2022 Make sure the Jade is setup with a companion app and Unlocked. Then export the xPub by going to Settings > Xpub Export. Also to be sure that the wallet type and script type is set to ${
    isMultisig ? 'MultiSig' : 'SingleSig'
  } and Native Segwit in the options section.\n`;
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
          {instructions}
        </Text>
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Make sure you enable Testnet mode on the Jade while creating the wallet with the companion app if you are running Keeper in the Testnet mode.`}
        </Text>
      </Box>
    </View>
  );
}

function KeeperSetupContent() {
  return (
    <View>
      <Box ml={wp(21)}>
        <KeeperSetupImage />
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
          {`\u2022 Choose a wallet or create a new one from your Linked Wallets\n`}
        </Text>
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Within settings choose Show Cosigner Details to scan the QR`}
        </Text>
      </Box>
    </View>
  );
}

function SettingSigningServer() {
  return (
    <Box>
      <SigningServerIllustration />
      <BulletPoint text="A 2FA authenticator will have to be set up to use this option" />
      <BulletPoint text="On providing the correct code from the auth app, the Signing Server will sign the transaction" />
    </Box>
  );
}

function SetUpMobileKey() {
  return (
    <Box>
      <MobileKeyIllustration />
      <BulletPoint text="To secure this key, you need the Recovery Phrase of the wallets to be backed up" />
      <BulletPoint text="This key available for signing transactions if you confirm your passcode or biometrics" />
    </Box>
  );
}

function SetupSeedWords() {
  return (
    <Box>
      <SeedWordsIllustration />
      <BulletPoint text="Once the transaction is signed the key is not stored on the app" />
      <BulletPoint text="Make sure that you are doing this step in private as exposing the Recovery Phrase will compromise the Soft Signer" />
    </Box>
  );
}

const setupPassport = (qrData, isMultisig) => {
  const { xpub, derivationPath, xfp, forMultiSig, forSingleSig } = getPassportDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const passport: VaultSigner = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp,
      signerType: SignerType.PASSPORT,
      storageType: SignerStorage.COLD,
    });
    return passport;
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const setupSeedSigner = (qrData, isMultisig) => {
  const { xpub, derivationPath, xfp, forMultiSig, forSingleSig } = getSeedSignerDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const seedSigner: VaultSigner = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp,
      signerType: SignerType.SEEDSIGNER,
      storageType: SignerStorage.COLD,
    });
    return seedSigner;
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const setupKeystone = (qrData, isMultisig) => {
  const { xpub, derivationPath, xfp, forMultiSig, forSingleSig } = getKeystoneDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const keystone: VaultSigner = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp,
      signerType: SignerType.KEYSTONE,
      storageType: SignerStorage.COLD,
    });
    return keystone;
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const setupJade = (qrData, isMultisig) => {
  const { xpub, derivationPath, xfp, forMultiSig, forSingleSig } = getJadeDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const jade: VaultSigner = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp,
      signerType: SignerType.JADE,
      storageType: SignerStorage.COLD,
    });
    return jade;
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const setupKeeperSigner = (qrData) => {
  const { mfp, xpub, derivationPath } = JSON.parse(qrData);
  const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);

  const ksd: VaultSigner = {
    signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
    type: SignerType.KEEPER,
    signerName: 'Keeper Signing Device',
    storageType: SignerStorage.WARM,
    xpub,
    xpubInfo: {
      derivationPath,
      xfp: mfp,
    },
    lastHealthCheck: new Date(),
    addedOn: new Date(),
  };

  return ksd;
};

const setupMobileKey = async ({ primaryMnemonic }) => {
  const networkType = config.NETWORK_TYPE;
  const network = WalletUtilities.getNetworkByType(networkType);
  const { xpub, xpriv, derivationPath, masterFingerprint } = await generateMobileKey(
    primaryMnemonic,
    networkType
  );

  const mobileKey: VaultSigner = {
    signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
    type: SignerType.MOBILE_KEY,
    signerName: 'Mobile Key',
    storageType: SignerStorage.WARM,
    xpub,
    xpriv,
    xpubInfo: {
      derivationPath,
      xfp: masterFingerprint,
    },
    lastHealthCheck: new Date(),
    addedOn: new Date(),
  };
  return mobileKey;
};

const setupSeedWordsBasedKey = (mnemonic) => {
  const networkType = config.NETWORK_TYPE;
  const network = WalletUtilities.getNetworkByType(networkType);
  const { xpub, derivationPath, masterFingerprint } = generateSeedWordsKey(mnemonic, networkType);

  const softSigner: VaultSigner = {
    signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
    type: SignerType.SEED_WORDS,
    storageType: SignerStorage.WARM,
    signerName: 'Seed Words',
    xpub,
    xpubInfo: {
      derivationPath,
      xfp: masterFingerprint,
    },
    lastHealthCheck: new Date(),
    addedOn: new Date(),
  };

  return softSigner;
};

function HardwareModalMap({ type, visible, close }) {
  const dispatch = useDispatch();

  const { translations } = useContext(LocalizationContext);
  const { tapsigner } = translations;
  const { coldcard } = translations;
  const { ledger } = translations;
  const [passwordModal, setPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const { pinHash } = useAppSelector((state) => state.storage);
  const loginMethod = useAppSelector((state) => state.settings.loginMethod);
  const appId = useAppSelector((state) => state.storage.appId);
  const { isAuthenticated, authenticationFailed } = useAppSelector((state) => state.login);
  const { useQuery } = useContext(RealmWrapperContext);
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const { subscriptionScheme } = usePlan();
  const isMultisig = subscriptionScheme.n !== 1;

  const navigation = useNavigation();
  const navigateToTapsignerSetup = () => {
    close();
    navigation.dispatch(CommonActions.navigate({ name: 'AddTapsigner', params: {} }));
  };

  const navigateToColdCardSetup = () => {
    close();
    navigation.dispatch(CommonActions.navigate({ name: 'AddColdCard', params: {} }));
  };

  const navigateToLedgerSetup = () => {
    close();
    navigation.dispatch(CommonActions.navigate({ name: 'AddLedger', params: {} }));
  };

  const navigateToSigningServerSetup = () => {
    close();
    navigation.dispatch(CommonActions.navigate({ name: 'ChoosePolicyNew', params: {} }));
  };

  const navigateToAddQrBasedSigner = () => {
    close();
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ScanQR',
        params: {
          title: `Setting up ${type}`,
          subtitle: 'Please scan until all the QR data has been retrieved',
          onQrScan: onQRScan,
        },
      })
    );
  };

  const { showToast } = useToastMessage();
  const navigateToSeedWordSetup = () => {
    close();
    const mnemonic = bip39.generateMnemonic();
    navigation.dispatch(
      CommonActions.navigate({
        name: 'SetupSeedWordSigner',
        params: {
          seed: mnemonic,
          next: true,
          onSuccess: (mnemonic) => {
            const softSigner = setupSeedWordsBasedKey(mnemonic);
            dispatch(addSigningDevice(softSigner));
            navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
            showToast(`${softSigner.signerName} added successfully`, <TickIcon />);
          },
        },
      })
    );
  };

  const onQRScan = (qrData, resetQR) => {
    let hw: VaultSigner;
    try {
      switch (type as SignerType) {
        case SignerType.PASSPORT:
          hw = setupPassport(qrData, isMultisig);
          break;
        case SignerType.SEEDSIGNER:
          hw = setupSeedSigner(qrData, isMultisig);
          break;
        case SignerType.KEEPER:
          hw = setupKeeperSigner(qrData);
          break;
        case SignerType.KEYSTONE:
          hw = setupKeystone(qrData, isMultisig);
          break;
        case SignerType.JADE:
          hw = setupJade(qrData, isMultisig);
          break;
        default:
          break;
      }
      dispatch(addSigningDevice(hw));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      showToast(`${hw.signerName} added successfully`, <TickIcon />);
    } catch (error) {
      if (error instanceof HWError) {
        showToast(error.message, null, 3000, true);
        resetQR();
      } else {
        captureError(error);
        Alert.alert(`Invalid QR, please scan the QR from a ${getSignerNameFromType(type)}`);
        navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
      }
    }
  };

  const biometricAuth = async () => {
    if (loginMethod === LoginMethod.BIOMETRIC) {
      try {
        setTimeout(async () => {
          const { success, signature } = await RNBiometrics.createSignature({
            promptMessage: 'Authenticate',
            payload: appId,
            cancelButtonText: 'Use PIN',
          });
          if (success) {
            const res = await SecureStore.verifyBiometricAuth(signature, appId);
            if (res.success) {
              const mobileKey = await setupMobileKey({ primaryMnemonic });
              dispatch(addSigningDevice(mobileKey));
              navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
              showToast(`${mobileKey.signerName} added successfully`, <TickIcon />);
            } else {
              Alert.alert('Incorrect password. Try again!');
            }
          }
        }, 200);
      } catch (error) {
        console.log(error);
      }
    } else {
      setPasswordModal(true);
    }
  };

  function PasswordEnter() {
    const onPressNumber = (text) => {
      let tmpPasscode = password;
      if (password.length < 4) {
        if (text !== 'x') {
          tmpPasscode += text;
          setPassword(tmpPasscode);
        }
      }
      if (password && text === 'x') {
        setPassword(password.slice(0, -1));
      }
    };

    const onDeletePressed = (text) => {
      setPassword(password.slice(0, password.length - 1));
    };

    return (
      <Box width={hp(280)}>
        <Box>
          <CVVInputsView
            passCode={password}
            passcodeFlag={false}
            backgroundColor
            textColor
            length={4}
          />
          <Text
            fontSize={13}
            letterSpacing={0.65}
            width={wp(290)}
            color="light.greenText"
            marginTop={2}
          >
            The app will use the Mobile Key to sign on entering the correct Passcode
          </Text>
          <Box mt={10} alignSelf="flex-end" mr={2}>
            <Box>
              <CustomGreenButton
                onPress={async () => {
                  const currentPinHash = hash512(password);
                  if (currentPinHash === pinHash) {
                    const mobileKey = await setupMobileKey({ primaryMnemonic });
                    dispatch(addSigningDevice(mobileKey));
                    navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
                    showToast(`${mobileKey.signerName} added successfully`, <TickIcon />);
                  } else Alert.alert('Incorrect password. Try again!');
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
  }

  return (
    <>
      <KeeperModal
        visible={visible && type === SignerType.TAPSIGNER}
        close={close}
        title={tapsigner.SetupTitle}
        subTitle={tapsigner.SetupDescription}
        buttonText="Proceed"
        buttonTextColor="light.white"
        buttonCallback={navigateToTapsignerSetup}
        textColor="light.primaryText"
        Content={() => <TapsignerSetupContent />}
      />
      <KeeperModal
        visible={visible && type === SignerType.COLDCARD}
        close={close}
        title={coldcard.SetupTitle}
        subTitle={`${coldcard.SetupDescription}`}
        buttonText="Proceed"
        buttonTextColor="light.white"
        buttonCallback={navigateToColdCardSetup}
        textColor="light.primaryText"
        Content={() => <ColdCardSetupContent isMultisig={isMultisig} />}
      />
      <KeeperModal
        visible={visible && type === SignerType.LEDGER}
        close={close}
        title={ledger.SetupTitle}
        subTitle={ledger.SetupDescription}
        buttonText="Proceed"
        buttonTextColor="light.white"
        buttonCallback={navigateToLedgerSetup}
        textColor="light.primaryText"
        Content={() => <LedgerSetupContent isMultisig={isMultisig} />}
      />
      <KeeperModal
        visible={visible && type === SignerType.POLICY_SERVER}
        close={close}
        title="Setting up a Signing Server"
        subTitle="A Signing Server will hold one of the keys in the vault"
        buttonText="Continue"
        buttonTextColor="light.white"
        buttonCallback={navigateToSigningServerSetup}
        textColor="light.primaryText"
        Content={SettingSigningServer}
      />
      <KeeperModal
        visible={visible && type === SignerType.MOBILE_KEY}
        close={close}
        title="Set up a Mobile Key"
        subTitle="This key available for signing transactions if you confirm your passcode or biometrics"
        buttonText="Proceed"
        buttonTextColor="light.white"
        buttonCallback={() => {
          close();
          biometricAuth();
        }}
        textColor="light.primaryText"
        Content={SetUpMobileKey}
      />
      <KeeperModal
        visible={passwordModal}
        close={() => {
          setPasswordModal(false);
        }}
        title="Enter your password"
        subTitle="The one you use to login to the app"
        textColor="light.primaryText"
        Content={PasswordEnter}
      />
      <KeeperModal
        visible={visible && type === SignerType.SEED_WORDS}
        close={close}
        title="Keep your Soft Signer ready"
        subTitle="This is the twelve word Recovery Phrase you would have noted down when creating the vault"
        buttonText="Proceed"
        buttonTextColor="light.white"
        buttonCallback={navigateToSeedWordSetup}
        textColor="light.primaryText"
        Content={SetupSeedWords}
      />
      <KeeperModal
        visible={false}
        close={close}
        title="Signing Server Setup Successfully"
        subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed"
        subTitleColor="light.secondaryText"
        buttonText="View Vault"
        buttonTextColor="light.white"
        buttonCallback={() => {
          console.log('View Vault');
        }}
        textColor="light.primaryText"
        Content={SetupSuccessfully}
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
        Content={() => <PassportSetupContent isMultisig={isMultisig} />}
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
        Content={() => <SeedSignerSetupContent isMultisig={isMultisig} />}
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
        Content={() => <KeystoneSetupContent isMultisig={isMultisig} />}
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
        Content={() => <JadeSetupContent isMultisig={isMultisig} />}
      />
      <KeeperModal
        visible={visible && type === SignerType.KEEPER}
        close={close}
        title="Keep your Device Ready"
        subTitle="Keep your Keeper Signing Device ready before proceeding"
        subTitleColor="light.secondaryText"
        buttonText="Continue"
        buttonTextColor="light.white"
        buttonCallback={navigateToAddQrBasedSigner}
        textColor="light.primaryText"
        Content={KeeperSetupContent}
      />
    </>
  );
}
const styles = StyleSheet.create({
  bulletContainer: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    marginRight: wp(5),
    height: hp(5),
    width: hp(5),
    borderRadius: 10,
    top: 12,
  },
  bullerPointText: {
    letterSpacing: 1,
    padding: 3,
    fontSize: 13,
  },
});
export default HardwareModalMap;
