import * as bip39 from 'bip39';

import { Alert, StyleSheet } from 'react-native';
import { Box, Text, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { generateMobileKey, generateSeedWordsKey } from 'src/core/wallets/factories/VaultFactory';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import DeleteIcon from 'src/assets/icons/deleteBlack.svg';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import LedgerImage from 'src/assets/images/ledger_image.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import MobileKeyIllustration from 'src/assets/images/mobileKey_illustration.svg';
import ReactNativeBiometrics from 'react-native-biometrics';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import SeedSignerSetupImage from 'src/assets/images/seedsigner_setup.svg';
import SeedWordsIllustration from 'src/assets/images/illustration_seed_words.svg';
import SigningServerIllustration from 'src/assets/images/signingServer_illustration.svg';
import SuccessIllustration from 'src/assets/images/success_illustration.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/core/services/sentry';
import config from 'src/core/config';
import { generateSignerFromMetaData } from 'src/hardware';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getPassportDetails } from 'src/hardware/passport';
import { getSeedSignerDetails } from 'src/hardware/seedsigner';
import { hash512 } from 'src/core/services/operations/encryption';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';

const RNBiometrics = new ReactNativeBiometrics();

const SetupSuccessfully = () => {
  return (
    <Box width={wp(270)}>
      <Box alignItems={'center'}>
        <SuccessIllustration />
      </Box>
      <Box marginTop={hp(0)}>
        <Text
          color={'light.modalText'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={1}
          letterSpacing={0.65}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        </Text>
      </Box>
    </Box>
  );
};

export const BulletPoint = ({ text }) => {
  return (
    <Box marginTop={'4'} flexDirection={'row'} alignItems={'flex-start'}>
      <Box
        style={{
          marginRight: wp(5),
        }}
        size={hp(5)}
        m={1}
        top={2}
        backgroundColor={'light.modalText'}
        borderRadius={10}
      />
      <Text
        color={'light.modalText'}
        fontSize={13}
        fontFamily={'body'}
        fontWeight={'200'}
        p={1}
        letterSpacing={1}
      >
        {text}
      </Text>
    </Box>
  );
};

const TapsignerSetupContent = () => {
  return (
    <View>
      <TapsignerSetupImage />
      <BulletPoint text={'You will need the Pin/CVC at the back of TAPSIGNER'} />
      <BulletPoint
        text={`You should generally not use the same signing device on multiple wallets/apps`}
      />
    </View>
  );
};

const ColdCardSetupContent = () => {
  return (
    <View>
      <Box ml={wp(21)}>
        <ColdCardSetupImage />
      </Box>
      <Box marginTop={'4'}>
        <Text
          color={'#073B36'}
          fontSize={13}
          fontWeight={200}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Export the xPub by going to Settings > Multisig wallet > Export xPub. From here choose the NFC option to make the transfer and remember the account you had chosen (This is important for recovering your vault).\n`}
        </Text>
        <Text
          color={'#073B36'}
          fontSize={13}
          fontWeight={200}
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
};
const LedgerSetupContent = () => {
  return (
    <View>
      <Box ml={wp(21)}>
        <LedgerImage />
      </Box>
      <Box marginTop={'4'} flex={1} alignItems={'center'} justifyContent={'center'}>
        <Box flex={1} flexDirection={'row'} alignItems={'space-between'} justifyContent={'center'}>
          <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'}>
            {`\u2022 Please make sure you have the BTC or BTC Testnet app downloaded on the Ledger based on the your current BTC network`}
          </Text>
        </Box>
        <Box flex={1} flexDirection={'row'} alignItems={'space-between'} justifyContent={'center'}>
          <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'}>
            {`\u2022 Proceed once you are on the app on the Nano X. Keeper will scan for your hardware and fetch the xPub`}
          </Text>
        </Box>
      </Box>
    </View>
  );
};

const PassportSetupContent = () => {
  return (
    <View>
      <Box ml={wp(21)}>
        <ColdCardSetupImage />
      </Box>
      <Box marginTop={'4'}>
        <Text
          color={'#073B36'}
          fontSize={13}
          fontWeight={200}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Export the xPub from the Account section > Manage Account > Connect Wallet > Keeper > Multisig > QR Code.\n`}
        </Text>
        <Text
          color={'#073B36'}
          fontSize={13}
          fontWeight={200}
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
};

const SeedSignerSetupContent = () => {
  return (
    <View>
      <Box ml={wp(21)}>
        <SeedSignerSetupImage />
      </Box>
      <Box marginTop={'4'}>
        <Text
          color={'#073B36'}
          fontSize={13}
          fontWeight={200}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Make sure the seed is loaded and export the xPub by going to Seeds > Select your master fingerprint > Export Xpub > Multisig > Nested Segwit > Keeper.\n`}
        </Text>
        <Text
          color={'#073B36'}
          fontSize={13}
          fontWeight={200}
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
};

const SettingSigningServer = () => {
  return (
    <Box>
      <SigningServerIllustration />
      <BulletPoint text={'A 2FA authenticator will have to be set up to use this option'} />
      <BulletPoint
        text={
          'On providing the correct code from the auth app, the Signing Server will sign the transaction'
        }
      />
    </Box>
  );
};

const SetUpMobileKey = () => {
  return (
    <Box>
      <MobileKeyIllustration />
      <BulletPoint
        text={'To secure this key, you need the Recovery Phrase of the wallets to be backed up'}
      />
      <BulletPoint
        text={
          'This key available for signing transactions if you confirm your passcode or biometrics'
        }
      />
    </Box>
  );
};

const SetupSeedWords = () => {
  return (
    <Box>
      <SeedWordsIllustration />
      <BulletPoint text={'Once the transaction is signed the key is not stored on the app'} />
      <BulletPoint
        text={
          'Make sure that you are doing this step in private as exposing the Recovery Phrase will compromise the Soft Signer'
        }
      />
    </Box>
  );
};

const HardwareModalMap = ({ type, visible, close }) => {
  const dispatch = useDispatch();

  const { translations } = useContext(LocalizationContext);
  const tapsigner = translations['tapsigner'];
  const coldcard = translations['coldcard'];
  const ledger = translations['ledger'];
  const [passwordModal, setPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const { pinHash } = useAppSelector((state) => state.storage);
  // const loginMethod = useAppSelector((state) => state.settings.loginMethod);
  // const appId = useAppSelector((state) => state.storage.appId);
  // const { isAuthenticated, authenticationFailed } = useAppSelector((state) => state.login);

  const { useQuery } = useContext(RealmWrapperContext);
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];

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

  const onQRScan = (qrData) => {
    switch (type as SignerType) {
      case SignerType.PASSPORT:
        return setupPassport(qrData);
      case SignerType.SEEDSIGNER:
        return setupSeedSigner(qrData);
      case SignerType.KEYSTONE:
      case SignerType.JADE:
      default:
        return;
    }
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

  const setupPassport = async (qrData) => {
    try {
      let { xpub, derivationPath, xfp } = getPassportDetails(qrData);
      const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
      xpub = WalletUtilities.generateXpubFromYpub(xpub, network);
      const passport: VaultSigner = generateSignerFromMetaData({
        xpub,
        derivationPath,
        xfp,
        signerType: SignerType.PASSPORT,
        storageType: SignerStorage.COLD,
      });
      dispatch(addSigningDevice(passport));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
    } catch (err) {
      console.log(err);
      captureError(err);
    }
  };

  const setupSeedSigner = async (qrData) => {
    try {
      let { xpub, derivationPath, xfp } = getSeedSignerDetails(qrData);
      const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
      xpub = WalletUtilities.generateXpubFromYpub(xpub, network);
      const seedSigner: VaultSigner = generateSignerFromMetaData({
        xpub,
        derivationPath,
        xfp,
        signerType: SignerType.SEEDSIGNER,
        storageType: SignerStorage.COLD,
      });
      dispatch(addSigningDevice(seedSigner));
      navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
    } catch (err) {
      console.log(err);
      captureError(err);
    }
  };

  const navigateToSeedWordSetup = () => {
    close();
    const mnemonic = bip39.generateMnemonic();
    navigation.dispatch(
      CommonActions.navigate({
        name: 'SetupSeedWordSigner',
        params: {
          seed: mnemonic,
          next: true,
          onSuccess: setupSeedWordsBasedKey,
        },
      })
    );
  };

  const setupMobileKey = async () => {
    const networkType = config.NETWORK_TYPE;
    const network = WalletUtilities.getNetworkByType(networkType);
    const { xpub, xpriv, derivationPath, masterFingerprint, bip85Config } = await generateMobileKey(
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
      bip85Config,
      lastHealthCheck: new Date(),
      addedOn: new Date(),
    };

    dispatch(addSigningDevice(mobileKey));
    navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
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

    dispatch(addSigningDevice(softSigner));
    navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
  };

  // const biometricAuth = async () => {
  //   if (loginMethod === LoginMethod.BIOMETRIC) {
  //     try {
  //       setTimeout(async () => {
  //         const { success, signature } = await RNBiometrics.createSignature({
  //           promptMessage: 'Authenticate',
  //           payload: appId,
  //           cancelButtonText: 'Use PIN',
  //         });
  //         if (success) {
  //           dispatch(credsAuth(signature, LoginMethod.BIOMETRIC));
  //         }
  //       }, 200);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // };

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     // biometric authentication
  //     setupMobileKey();
  //   }
  // }, [isAuthenticated]);

  const passwordEnter = () => {
    const onPressNumber = (text) => {
      let tmpPasscode = password;
      if (password.length < 4) {
        if (text != 'x') {
          tmpPasscode += text;
          setPassword(tmpPasscode);
        }
      }
      if (password && text == 'x') {
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
            backgroundColor={true}
            textColor={true}
            length={4}
          />
          <Text
            fontSize={13}
            fontWeight={200}
            letterSpacing={0.65}
            width={wp(290)}
            color={'light.modalText'}
            marginTop={2}
          >
            The app will use the Mobile Key to sign on entering the correct Passcode
          </Text>
          <Box mt={10} alignSelf={'flex-end'} mr={2}>
            <Box>
              <CustomGreenButton
                onPress={() => {
                  const currentPinHash = hash512(password);
                  if (currentPinHash === pinHash) setupMobileKey();
                  else Alert.alert('Incorrect password. Try again!');
                }}
                value={'Confirm'}
              />
            </Box>
          </Box>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={'light.lightBlack'}
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    );
  };

  return (
    <>
      <KeeperModal
        visible={visible && type === SignerType.TAPSIGNER}
        close={close}
        title={tapsigner.SetupTitle}
        subTitle={tapsigner.SetupDescription}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Proceed'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToTapsignerSetup}
        textColor={'#041513'}
        Content={TapsignerSetupContent}
      />
      <KeeperModal
        visible={visible && type === SignerType.COLDCARD}
        close={close}
        title={coldcard.SetupTitle}
        subTitle={coldcard.SetupDescription}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Proceed'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToColdCardSetup}
        textColor={'#041513'}
        Content={ColdCardSetupContent}
      />
      <KeeperModal
        visible={visible && type === SignerType.LEDGER}
        close={close}
        title={ledger.SetupTitle}
        subTitle={ledger.SetupDescription}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Proceed'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToLedgerSetup}
        textColor={'#041513'}
        Content={LedgerSetupContent}
      />
      <KeeperModal
        visible={visible && type === SignerType.POLICY_SERVER}
        close={close}
        title={'Setting up a Signing Server'}
        subTitle={'A Signing Server will hold one of the keys in the vault'}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Continue'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToSigningServerSetup}
        textColor={'#041513'}
        Content={SettingSigningServer}
      />
      <KeeperModal
        visible={visible && type === SignerType.MOBILE_KEY}
        close={close}
        title={'Set up a Mobile Key'}
        subTitle={
          'This key available for signing transactions if you confirm your passcode or biometrics'
        }
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Proceed'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={() => {
          close();
          setPasswordModal(true);
        }}
        textColor={'#041513'}
        Content={SetUpMobileKey}
      />
      <KeeperModal
        visible={passwordModal}
        close={() => {
          setPasswordModal(false);
        }}
        title={'Enter your password'}
        subTitle={'The one you use to login to the app'}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        textColor={'#041513'}
        Content={passwordEnter}
      />
      <KeeperModal
        visible={visible && type === SignerType.SEED_WORDS}
        close={close}
        title={'Keep your Soft Signer ready'}
        subTitle={
          'This is the twelve word Recovery Phrase you would have noted down when creating the vault'
        }
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Proceed'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToSeedWordSetup}
        textColor={'#041513'}
        Content={SetupSeedWords}
      />
      <KeeperModal
        visible={false}
        close={close}
        title={'Signing Server Setup Successfully'}
        subTitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed'}
        subTitleColor={'#5F6965'}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'View Vault'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={() => {
          console.log('View Vault');
        }}
        textColor={'#041513'}
        Content={SetupSuccessfully}
      />
      <KeeperModal
        visible={visible && type === SignerType.PASSPORT}
        close={close}
        title={'Setting up Passport (Batch 2)'}
        subTitle={'Keep your Foundation Passport (Batch 2) ready before proceeding'}
        subTitleColor={'#5F6965'}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Continue'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToAddQrBasedSigner}
        textColor={'#041513'}
        Content={PassportSetupContent}
      />
      <KeeperModal
        visible={visible && type === SignerType.SEEDSIGNER}
        close={close}
        title={'Setting up SeedSigner'}
        subTitle={'Keep your SeedSigner ready and powered before proceeding'}
        subTitleColor={'#5F6965'}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Continue'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToAddQrBasedSigner}
        textColor={'#041513'}
        Content={SeedSignerSetupContent}
      />
    </>
  );
};

export default HardwareModalMap;

const styles = StyleSheet.create({});
