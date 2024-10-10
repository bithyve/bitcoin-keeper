import { Alert } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, HStack, useColorMode } from 'native-base';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { hp, wp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import ColdCardSVG from 'src/assets/images/ColdCardSetup.svg';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import JadeSetup from 'src/assets/images/illustration_jade.svg';
import KeeperSetup from 'src/assets/images/illustration_ksd.svg';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import KeystoneSetup from 'src/assets/images/keystone_illustration.svg';
import LoginMethod from 'src/models/enums/LoginMethod';
import PassportSVG from 'src/assets/images/illustration_passport.svg';
import ReactNativeBiometrics from 'react-native-biometrics';
import SeedSignerSetup from 'src/assets/images/seedsigner_setup.svg';
import SpecterSetupImage from 'src/assets/images/illustration_spectre.svg';
import { SignerType, SigningMode } from 'src/services/wallets/enums';
import TapsignerSetupSVG from 'src/assets/images/TapsignerSetup.svg';
import { credsAuthenticated } from 'src/store/reducers/login';
import { hash512 } from 'src/utils/service-utilities/encryption';
import config, { KEEPER_WEBSITE_BASE_URL } from 'src/utils/service-utilities/config';
import BitoxImage from 'src/assets/images/bitboxSetup.svg';
import OtherSDImage from 'src/assets/images/illustration_othersd.svg';
import TrezorSetup from 'src/assets/images/trezor_setup.svg';
import LedgerImage from 'src/assets/images/ledger_image.svg';
import { Signer, VaultSigner } from 'src/services/wallets/interfaces/vault';
import * as SecureStore from 'src/storage/secure-store';
import Buttons from 'src/components/Buttons';
import useAsync from 'src/hooks/useAsync';
import Instruction from 'src/components/Instruction';
import { getSignerNameFromType } from 'src/hardware';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import QRComms from 'src/assets/images/qr_comms.svg';
import NfcComms from 'src/assets/images/nfc_comms.svg';
import Import from 'src/assets/images/import.svg';
import SignerCard from '../AddSigner/SignerCard';
import { SerializedPSBTEnvelop } from 'src/services/wallets/interfaces';
import { InteracationMode } from '../Vault/HardwareModalMap';

const RNBiometrics = new ReactNativeBiometrics();

function ColdCardContent({
  register,
  isMultisig,
  supportedSigningOptions,
  onSelect,
  signingMode,
}: {
  register: boolean;
  isMultisig: boolean;
  supportedSigningOptions: any[];
  onSelect: any;
  signingMode: SigningMode;
}) {
  const { colorMode } = useColorMode();
  let message = '';

  if (register) {
    message =
      '\u2022 Since this is the first time you are signing with this device, the Coldcard requires for us to register the multisig wallet data before it can sign transactions.';
  } else if (isMultisig) {
    message =
      '\u2022 Make sure the multisig wallet is registered with the Coldcard before signing the transaction';
  }

  return (
    <Box alignItems="center">
      <ColdCardSVG />
      <Box marginTop={2}>
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {message}
        </Text>
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {register
            ? ''
            : "\u2022 On the Coldcard main menu, choose the 'Ready to sign' option and choose the nfc option."}
        </Text>
      </Box>
      <HStack alignSelf={'flex-start'}>
        {supportedSigningOptions &&
          supportedSigningOptions.map((option) => (
            <SignerCard
              key={option.name}
              isSelected={signingMode === option.name}
              isFullText={true}
              name={option.title}
              icon={option.icon}
              image={option?.extraData?.thumbnailPath}
              onCardSelect={() => {
                onSelect(option.name);
              }}
              colorMode={colorMode}
            />
          ))}
      </HStack>
    </Box>
  );
}

function PassportContent({
  isMultisig,
  supportedSigningOptions,
  onSelect,
  signingMode,
}: {
  isMultisig: boolean;
  supportedSigningOptions: any[];
  onSelect: any;
  signingMode: SigningMode;
}) {
  const { colorMode } = useColorMode();
  return (
    <Box alignItems="center">
      <PassportSVG />
      <Box marginTop={2}>
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {`\u2022 Make sure ${
            isMultisig ? 'the multisig wallet is registered with the Passport and ' : ''
          }the right bitcoin network is set before signing the transaction`}
        </Text>
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {"\u2022 On the Passport main menu, choose the 'Sign with QR Code' option."}
        </Text>
      </Box>
      <HStack alignSelf={'flex-start'}>
        {supportedSigningOptions &&
          supportedSigningOptions.map((option) => (
            <SignerCard
              key={option.name}
              isSelected={signingMode === option.name}
              isFullText={true}
              name={option.title}
              icon={option.icon}
              image={option?.extraData?.thumbnailPath}
              onCardSelect={() => {
                onSelect(option.name);
              }}
              colorMode={colorMode}
            />
          ))}
      </HStack>
    </Box>
  );
}

function SeedSignerContent({ isMultisig }: { isMultisig: boolean }) {
  const { colorMode } = useColorMode();
  return (
    <Box alignItems="center">
      <SeedSignerSetup />
      <Box marginTop={2}>
        {isMultisig ? (
          <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
            {
              '\u2022 The change address verification step (wallet registration) with SeedSigner shows up at the time of PSBT verification.'
            }
          </Text>
        ) : null}
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {
            "\u2022 On the SeedSigner main menu, choose the 'Scan' option and wait for the QR to be scanned."
          }
        </Text>
      </Box>
    </Box>
  );
}

function SpecterContent({ isMultisig }: { isMultisig: boolean }) {
  const { colorMode } = useColorMode();
  return (
    <Box alignItems="center">
      <SpecterSetupImage />
      <Box marginTop={2}>
        {`\u2022 Make sure ${
          isMultisig ? 'the multisig wallet is registered with the Specter and ' : ''
        }the right bitcoin network is set before signing the transaction`}
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {
            "\u2022 On the Specter main menu, choose the 'Scan QR code' option and wait for the QR to be scanned."
          }
        </Text>
      </Box>
    </Box>
  );
}

function KeystoneContent({
  isMultisig,
  supportedSigningOptions,
  onSelect,
  signingMode,
}: {
  isMultisig: boolean;
  supportedSigningOptions: any[];
  onSelect: any;
  signingMode: SigningMode;
}) {
  const { colorMode } = useColorMode();
  return (
    <Box alignItems="center">
      <KeystoneSetup />
      <Box marginTop={2}>
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {`\u2022 Make sure ${
            isMultisig ? 'the multisig wallet is registered with the Keystone and ' : ''
          }the right bitcoin network is set before signing the transaction`}
        </Text>
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {`\u2022 On the Keystone ${
            isMultisig ? 'multisig menu' : 'Generic Wallet section'
          }, press the scan icon on the top bar and wait for the QR to be scanned.`}
        </Text>
      </Box>
      <HStack alignSelf={'flex-start'}>
        {supportedSigningOptions &&
          supportedSigningOptions.map((option) => (
            <SignerCard
              key={option.name}
              isSelected={signingMode === option.name}
              isFullText={true}
              name={option.title}
              icon={option.icon}
              image={option?.extraData?.thumbnailPath}
              onCardSelect={() => {
                onSelect(option.name);
              }}
              colorMode={colorMode}
            />
          ))}
      </HStack>
    </Box>
  );
}

function JadeContent() {
  const { colorMode } = useColorMode();
  return (
    <Box alignItems="center">
      <JadeSetup />
      <Box marginTop={2}>
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {
            "\u2022 On the Jade main menu, choose the 'Scan QR' option and wait for the QR to be scanned."
          }
        </Text>
      </Box>
    </Box>
  );
}

function TrezorContent() {
  const { colorMode } = useColorMode();
  return (
    <Box alignItems="center">
      <TrezorSetup />
      <Box marginTop={2}>
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {
            '\u2022 The Keeper Harware Interface will exchange the signed/unsigned PSBT from/to the Keeper app and the signer.'
          }
        </Text>
      </Box>
    </Box>
  );
}

function BitBox02Content() {
  const { colorMode } = useColorMode();
  return (
    <Box alignItems="center">
      <BitoxImage />
      <Box marginTop={2}>
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {
            '\u2022 The Keeper Harware Interface will exchange the signed/unsigned PSBT from/to the Keeper app and the signer.'
          }
        </Text>
      </Box>
    </Box>
  );
}

function LedgerContent() {
  const { colorMode } = useColorMode();
  return (
    <Box alignItems="center">
      <LedgerImage />
      <Box marginTop={2}>
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {
            '\u2022 The Keeper Harware Interface will exchange the signed/unsigned PSBT from/to the Keeper app and the signer.'
          }
        </Text>
      </Box>
    </Box>
  );
}

function OtherSDContent() {
  const { colorMode } = useColorMode();
  return (
    <Box alignItems="center">
      <OtherSDImage />
      <Box marginTop={2}>
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {'\u2022 Either scan or use the export option to transfer the PSBT to the signer.'}
        </Text>
      </Box>
    </Box>
  );
}
export function KeeperContent(props) {
  const { colorMode } = useColorMode();
  return (
    <Box alignItems="center">
      <KeeperSetup />
      <Box marginTop={2}>
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
          {`Open the other Keeper app > Go to Manage Keys > Access the Mobile Key with the fingerprint ${props.masterFingerPrint} > Go to Settings > Sign a transaction > Scan the QR using the scanner`}
        </Text>
      </Box>
    </Box>
  );
}

function TapsignerContent() {
  return (
    <>
      <TapsignerSetupSVG />
      <Instruction text="TAPSIGNER communicates with the app over NFC" />
      <Instruction text="You will need the CVC/ Pin on the back of the card" />
    </>
  );
}

function PasswordEnter({ signTransaction, setPasswordModal }) {
  const { colorMode } = useColorMode();
  const { pinHash } = useAppSelector((state) => state.storage);
  const loginMethod = useAppSelector((state) => state.settings.loginMethod);
  const appId = useAppSelector((state) => state.storage.appId);
  const dispatch = useAppDispatch();
  const { inProgress, start } = useAsync();
  const [password, setPassword] = useState('');

  useEffect(() => {
    biometricAuth();
    return () => {
      dispatch(credsAuthenticated(false));
    };
  }, []);

  const biometricAuth = async () => {
    if (loginMethod === LoginMethod.BIOMETRIC) {
      try {
        setPasswordModal(false);
        setTimeout(async () => {
          const { success, signature } = await RNBiometrics.createSignature({
            promptMessage: 'Authenticate',
            payload: appId,
            cancelButtonText: 'Use PIN',
          });
          if (success) {
            const res = await SecureStore.verifyBiometricAuth(signature, appId);
            if (res.success) {
              signTransaction();
            } else {
              Alert.alert('Invalid auth. Try again!');
            }
          }
        }, 200);
      } catch (error) {
        console.log(error);
      }
    }
  };

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

  const onDeletePressed = () => setPassword(password.slice(0, password.length - 1));

  const primaryCallback = () =>
    start(async () => {
      const currentPinHash = hash512(password);
      if (currentPinHash === pinHash) {
        await signTransaction();
      } else Alert.alert('Incorrect password. Try again!');
    });

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
          color={`${colorMode}.greenText`}
          marginTop={2}
        />
        <Box mt={10} alignSelf="flex-end" mr={2}>
          <Buttons
            primaryCallback={primaryCallback}
            primaryText="Confirm"
            primaryLoading={inProgress}
          />
        </Box>
      </Box>
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={`${colorMode}.primaryText`}
        ClearIcon={<DeleteIcon />}
      />
    </Box>
  );
}

function OtpContent({ signTransaction }) {
  const { colorMode } = useColorMode();
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
    <Box width={'100%'}>
      <Box>
        <CVVInputsView passCode={otp} passcodeFlag={false} backgroundColor textColor />
        <Text
          fontSize={13}
          letterSpacing={0.65}
          width={wp(290)}
          color={`${colorMode}.greenText`}
          marginTop={2}
        >
          If you lose your authenticator app, use the other signers to reset the signer
        </Text>
        <Box mt={10} alignSelf="flex-end" mr={2}>
          <Box>
            <CustomGreenButton
              onPress={() => {
                signTransaction({ signingServerOTP: otp });
              }}
              value="proceed"
            />
          </Box>
        </Box>
      </Box>
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={`${colorMode}.primaryText`}
        ClearIcon={<DeleteIcon />}
      />
    </Box>
  );
}

const getSupportedSigningOptions = (signerType: SignerType, colorMode) => {
  switch (signerType) {
    case SignerType.COLDCARD:
      return {
        supportedSigningOptions: [
          {
            title: 'NFC',
            icon: (
              <CircleIconWrapper
                icon={<NfcComms />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: SigningMode.NFC,
          },
          {
            title: 'File',
            icon: (
              <CircleIconWrapper
                icon={<Import />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: SigningMode.FILE,
          },
        ],
      };
    case SignerType.KEYSTONE:
    case SignerType.PASSPORT:
      return {
        supportedSigningOptions: [
          {
            title: 'QR',
            icon: (
              <CircleIconWrapper
                icon={<QRComms />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: SigningMode.QR,
          },
          {
            title: 'File',
            icon: (
              <CircleIconWrapper
                icon={<Import />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: SigningMode.FILE,
          },
        ],
      };
    default:
      return {
        supportedSigningOptions: [],
      };
  }
};

function SignerModals({
  vaultId,
  activeXfp,
  coldCardModal,
  tapsignerModal,
  ledgerModal,
  otpModal,
  passwordModal,
  passportModal,
  seedSignerModal,
  keystoneModal,
  jadeModal,
  keeperModal,
  trezorModal,
  bitbox02Modal,
  otherSDModal,
  setOtherSDModal,
  setTrezorModal,
  setBitbox02Modal,
  setJadeModal,
  setKeystoneModal,
  setSeedSignerModal,
  setPassportModal,
  setKeeperModal,
  setColdCardModal,
  setTapsignerModal,
  setLedgerModal,
  setPasswordModal,
  showOTPModal,
  signTransaction,
  vaultKeys,
  isMultisig,
  signerMap,
  specterModal,
  setSpecterModal,
  onFileSign,
}: {
  vaultId: string;
  activeXfp: string;
  coldCardModal: boolean;
  tapsignerModal: boolean;
  ledgerModal: boolean;
  otpModal: boolean;
  passwordModal: boolean;
  passportModal: boolean;
  seedSignerModal: boolean;
  keystoneModal: boolean;
  jadeModal: boolean;
  keeperModal: boolean;
  trezorModal: boolean;
  bitbox02Modal: boolean;
  otherSDModal: boolean;
  setOtherSDModal: any;
  setTrezorModal: any;
  setBitbox02Modal: any;
  setJadeModal: any;
  setKeystoneModal: any;
  setSeedSignerModal: any;
  setPassportModal: any;
  setKeeperModal: any;
  setColdCardModal: any;
  setTapsignerModal: any;
  setLedgerModal: any;
  setPasswordModal: any;
  showOTPModal: any;
  signTransaction: any;
  vaultKeys: VaultSigner[];
  isMultisig: boolean;
  signerMap: { [key: string]: Signer };
  specterModal: boolean;
  setSpecterModal: any;
  onFileSign: any;
}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const serializedPSBTEnvelop: SerializedPSBTEnvelop = serializedPSBTEnvelops.filter(
    (envelop) => envelop.xfp === activeXfp
  )[0];

  const navigateToQrSigning = (vaultKey: VaultSigner) => {
    setPassportModal(false);
    setSeedSignerModal(false);
    setKeeperModal(false);
    setOtherSDModal(false);
    setJadeModal(false);
    setSpecterModal(false);
    navigation.dispatch(
      CommonActions.navigate('SignWithQR', {
        signTransaction,
        vaultKey,
        vaultId,
      })
    );
  };

  const navigateToChannelSigning = (vaultKey: VaultSigner, signerType: string) => {
    setTrezorModal(false);
    setBitbox02Modal(false);
    setLedgerModal(false);
    navigation.dispatch(
      CommonActions.navigate('SignWithChannel', {
        signTransaction,
        vaultKey,
        vaultId,
        signerType,
      })
    );
  };
  return (
    <>
      {vaultKeys.map((vaultKey) => {
        const signer = signerMap[vaultKey.masterFingerprint];
        const currentSigner = vaultKey.xfp === activeXfp;
        const { supportedSigningOptions } = getSupportedSigningOptions(signer.type, colorMode);
        const [signingMode, setSigningMode] = useState<SigningMode>(
          supportedSigningOptions[0]?.name || null
        );
        if (signer.type === SignerType.TAPSIGNER) {
          const navigateToSignWithTapsigner = () => {
            setTapsignerModal(false);
            navigation.dispatch(
              CommonActions.navigate('TapsignerAction', {
                mode: InteracationMode.SIGN_TRANSACTION,
                signer,
                isMultisig,
                signTransaction,
              })
            );
          };
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && tapsignerModal}
              close={() => setTapsignerModal(false)}
              title="Keep your TAPSIGNER ready"
              subTitle="Keep your TAPSIGNER ready before proceeding"
              buttonText="Proceed"
              buttonCallback={navigateToSignWithTapsigner}
              Content={() => <TapsignerContent />}
            />
          );
        }
        if (signer.type === SignerType.COLDCARD) {
          const info = vaultKey.registeredVaults.find((info) => info.vaultId === vaultId);
          const navigateToSignWithColdCard = () => {
            setColdCardModal(false);
            if (signingMode === SigningMode.FILE) {
              navigation.dispatch(
                CommonActions.navigate({
                  name: 'HandleFile',
                  params: {
                    title: `Signing with ${getSignerNameFromType(signer.type)}`,
                    subTitle: 'Please upload or paste the file containing the signed transaction',
                    ctaText: 'Proceed',
                    onFileExtract: onFileSign,
                    fileData: serializedPSBTEnvelop.serializedPSBT,
                    signerType: signer.type,
                  },
                })
              );
              return;
            }
            navigation.dispatch(
              CommonActions.navigate('SignWithColdCard', {
                signTransaction,
                vaultKey,
                isMultisig,
                vaultId,
              })
            );
          };
          const shouldRegister = isMultisig && !info?.registered;
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && coldCardModal}
              close={() => setColdCardModal(false)}
              title={shouldRegister ? 'Register Coldcard' : 'Keep your Coldcard ready'}
              subTitle="Keep your Coldcard ready before proceeding"
              Content={() => (
                <ColdCardContent
                  register={shouldRegister}
                  isMultisig={isMultisig}
                  supportedSigningOptions={supportedSigningOptions}
                  onSelect={(mode) => {
                    setSigningMode(mode);
                  }}
                  signingMode={signingMode}
                />
              )}
              buttonText={shouldRegister ? 'Register' : 'Proceed'}
              buttonCallback={navigateToSignWithColdCard}
            />
          );
        }
        if (signer.type === SignerType.LEDGER) {
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && ledgerModal}
              close={() => {
                setLedgerModal(false);
              }}
              title="Keep Nano X Ready"
              subTitle={`Please download the Bitcoin Keeper desktop app from our website (${KEEPER_WEBSITE_BASE_URL}) to connect with Trezor.`}
              textColor={`${colorMode}.primaryText`}
              Content={() => <LedgerContent />}
              buttonText="Proceed"
              buttonCallback={() => navigateToChannelSigning(vaultKey, signer.type)}
            />
          );
        }
        if (signer.type === SignerType.MOBILE_KEY) {
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && passwordModal}
              close={() => {
                setPasswordModal(false);
              }}
              title="Enter your password"
              subTitle=""
              textColor={`${colorMode}.primaryText`}
              Content={() => (
                <PasswordEnter
                  signTransaction={signTransaction}
                  setPasswordModal={setPassportModal}
                />
              )}
            />
          );
        }
        if (signer.type === SignerType.POLICY_SERVER) {
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && otpModal}
              close={() => {
                showOTPModal(false);
              }}
              title="Confirm OTP to sign transaction"
              subTitle="To sign using signer key"
              textColor={`${colorMode}.primaryText`}
              Content={() => <OtpContent signTransaction={signTransaction} />}
            />
          );
        }
        if (signer.type === SignerType.PASSPORT) {
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && passportModal}
              close={() => {
                setPassportModal(false);
              }}
              title="Keep Passport Ready"
              subTitle="Keep your Foundation Passport ready before proceeding"
              textColor={`${colorMode}.primaryText`}
              Content={() => (
                <PassportContent
                  isMultisig={isMultisig}
                  supportedSigningOptions={supportedSigningOptions}
                  onSelect={(mode) => {
                    setSigningMode(mode);
                  }}
                  signingMode={signingMode}
                />
              )}
              buttonText="Proceed"
              buttonCallback={() => {
                setPassportModal(false);
                if (signingMode === SigningMode.FILE) {
                  navigation.dispatch(
                    CommonActions.navigate({
                      name: 'HandleFile',
                      params: {
                        title: `Signing with ${getSignerNameFromType(signer.type)}`,
                        subTitle:
                          'Please upload or paste the file containing the signed transaction',
                        ctaText: 'Proceed',
                        onFileExtract: onFileSign,
                        fileData: serializedPSBTEnvelop.serializedPSBT,
                        signerType: signer.type,
                      },
                    })
                  );
                  return;
                }
                navigateToQrSigning(vaultKey);
              }}
            />
          );
        }
        if (signer.type === SignerType.SEEDSIGNER) {
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && seedSignerModal}
              close={() => {
                setSeedSignerModal(false);
              }}
              title="Keep SeedSigner Ready"
              subTitle="Keep your SeedSigner ready before proceeding"
              textColor={`${colorMode}.primaryText`}
              Content={() => <SeedSignerContent isMultisig={isMultisig} />}
              buttonText="Proceed"
              buttonCallback={() => navigateToQrSigning(vaultKey)}
            />
          );
        }
        if (signer.type === SignerType.SPECTER) {
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && specterModal}
              close={() => {
                setSpecterModal(false);
              }}
              title="Keep Specter Ready"
              subTitle="Keep your Specter ready before proceeding"
              textColor={`${colorMode}.primaryText`}
              Content={() => <SpecterContent isMultisig={isMultisig} />}
              buttonText="Proceed"
              buttonCallback={() => navigateToQrSigning(vaultKey)}
            />
          );
        }
        if (signer.type === SignerType.KEYSTONE) {
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && keystoneModal}
              close={() => {
                setKeystoneModal(false);
              }}
              title="Keep Keystone Ready"
              subTitle="Keep your Keystone ready before proceeding"
              textColor={`${colorMode}.primaryText`}
              Content={() => (
                <KeystoneContent
                  isMultisig={isMultisig}
                  supportedSigningOptions={supportedSigningOptions}
                  onSelect={(mode) => {
                    setSigningMode(mode);
                  }}
                  signingMode={signingMode}
                />
              )}
              buttonText="Proceed"
              buttonCallback={() => {
                setKeystoneModal(false);
                if (signingMode === SigningMode.FILE) {
                  navigation.dispatch(
                    CommonActions.navigate({
                      name: 'HandleFile',
                      params: {
                        title: `Signing with ${getSignerNameFromType(signer.type)}`,
                        subTitle:
                          'Please upload or paste the file containing the signed transaction',
                        ctaText: 'Proceed',
                        onFileExtract: onFileSign,
                        fileData: serializedPSBTEnvelop.serializedPSBT,
                        signerType: signer.type,
                      },
                    })
                  );
                  return;
                }
                navigateToQrSigning(vaultKey);
              }}
            />
          );
        }
        if (signer.type === SignerType.JADE) {
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && jadeModal}
              close={() => {
                setJadeModal(false);
              }}
              title="Keep Jade Ready"
              subTitle="Keep your Jade ready before proceeding"
              textColor={`${colorMode}.primaryText`}
              Content={() => <JadeContent />}
              buttonText="Proceed"
              buttonCallback={() => navigateToQrSigning(vaultKey)}
            />
          );
        }
        if (signer.type === SignerType.TREZOR) {
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && trezorModal}
              close={() => {
                setTrezorModal(false);
              }}
              title="Keep Trezor Ready"
              subTitle={`Please download the Bitcoin Keeper desktop app from our website (${KEEPER_WEBSITE_BASE_URL}) to connect with Trezor.`}
              textColor={`${colorMode}.primaryText`}
              Content={() => <TrezorContent />}
              buttonText="Proceed"
              buttonCallback={() => navigateToChannelSigning(vaultKey, signer.type)}
            />
          );
        }
        if (signer.type === SignerType.BITBOX02) {
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && bitbox02Modal}
              close={() => {
                setBitbox02Modal(false);
              }}
              title="Keep BitBox02 Ready"
              subTitle={`Please download the Bitcoin Keeper desktop app from our website (${KEEPER_WEBSITE_BASE_URL}) to connect with BitBox02.`}
              textColor={`${colorMode}.primaryText`}
              Content={() => <BitBox02Content />}
              buttonText="Proceed"
              buttonCallback={() => navigateToChannelSigning(vaultKey, signer.type)}
            />
          );
        }
        if (signer.type === SignerType.OTHER_SD) {
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && otherSDModal}
              close={() => {
                setOtherSDModal(false);
              }}
              title="Keep the Signer Ready"
              subTitle="Keep your Signer ready before proceeding"
              textColor={`${colorMode}.primaryText`}
              Content={() => <OtherSDContent />}
              buttonText="Proceed"
              buttonCallback={() => navigateToQrSigning(vaultKey)}
            />
          );
        }
        if (signer.type === SignerType.KEEPER) {
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && keeperModal}
              close={() => {
                setKeeperModal(false);
              }}
              title="Keep your Device Ready"
              subTitle={`Keep your ${getSignerNameFromType(signer.type)} ready before proceeding`}
              textColor={`${colorMode}.primaryText`}
              Content={() => (
                <KeeperContent masterFingerPrint={signer && signer.masterFingerprint} />
              )}
              buttonText="Proceed"
              buttonCallback={() => navigateToQrSigning(vaultKey)}
            />
          );
        }
        return null;
      })}
    </>
  );
}

export default SignerModals;
