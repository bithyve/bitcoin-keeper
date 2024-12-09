import { Alert, StyleSheet } from 'react-native';
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
import PortalIllustration from 'src/assets/images/portal_illustration.svg';
import ReactNativeBiometrics from 'react-native-biometrics';
import SeedSignerSetup from 'src/assets/images/seedsigner_setup.svg';
import SpecterSetupImage from 'src/assets/images/illustration_spectre.svg';
import { SignerType, SigningMode } from 'src/services/wallets/enums';
import TapsignerSetupSVG from 'src/assets/images/TapsignerSetup.svg';
import { credsAuthenticated } from 'src/store/reducers/login';
import { hash512 } from 'src/utils/service-utilities/encryption';
import { KEEPER_WEBSITE_BASE_URL } from 'src/utils/service-utilities/config';
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
import USBIcon from 'src/assets/images/usb_white.svg';
import SignerCard from '../AddSigner/SignerCard';
import { SerializedPSBTEnvelop } from 'src/services/wallets/interfaces';
import { InteracationMode } from '../Vault/HardwareModalMap';
import { SendConfirmationRouteParams, tnxDetailsProps } from '../Send/SendConfirmation';
import { getAccountFromSigner, getKeyUID } from 'src/utils/utilities';

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

  if (isMultisig) {
    message =
      '\u2022 Make sure the multisig wallet is registered with the Coldcard before signing the transaction';
  }

  return (
    <Box alignItems="center">
      <ColdCardSVG />
      <Box marginTop={2}>
        <Text style={{ fontSize: 14, letterSpacing: 0.65, margin: 7 }}>{message}</Text>
        <Text semiBold style={{ fontSize: 14, letterSpacing: 0.65, margin: 7 }}>
          {'Sign transaction via:'}
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
              customStyle={{
                width: wp(95),
                height: hp(
                  supportedSigningOptions.some((opt) => opt.title.length > 10) ? 115 : 100
                ),
              }}
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
        {isMultisig && (
          <Text style={styles.instructionsText}>
            {
              '\u2022 Make sure the multisig wallet is registered with the Passport before signing the transaction.'
            }
          </Text>
        )}
        <Text style={styles.instructionsText}>
          {
            "\u2022 For QR signing, on the Passport main menu, choose the 'Sign with QR Code' option."
          }
        </Text>
        <Text semiBold style={styles.instructionsText}>
          {'Sign transaction via:'}
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
              customStyle={{
                width: wp(95),
                height: hp(
                  supportedSigningOptions.some((opt) => opt.title.length > 10) ? 115 : 100
                ),
              }}
            />
          ))}
      </HStack>
    </Box>
  );
}

function SeedSignerContent({ isMultisig }: { isMultisig: boolean }) {
  return (
    <Box alignItems="center">
      <SeedSignerSetup />
      <Box marginTop={2}>
        {isMultisig ? (
          <Text style={styles.instructionsText}>
            {
              '\u2022 The change address verification step (wallet registration) with SeedSigner shows up at the time of PSBT verification.'
            }
          </Text>
        ) : null}
        <Text style={styles.instructionsText}>
          {
            "\u2022 On the SeedSigner main menu, choose the 'Scan' option and wait for the QR to be scanned."
          }
        </Text>
      </Box>
    </Box>
  );
}

function SpecterContent({ isMultisig }: { isMultisig: boolean }) {
  return (
    <Box alignItems="center">
      <SpecterSetupImage />
      <Box marginTop={2}>
        {isMultisig && (
          <Text style={styles.instructionsText}>
            {`\u2022 Make sure the multisig wallet is registered with the Specter before signing the transaction`}
          </Text>
        )}
        <Text style={styles.instructionsText}>
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
        {isMultisig && (
          <Text style={styles.instructionsText}>
            {
              '\u2022 Make sure the multisig wallet is registered with the Keystone before signing the transaction.'
            }
          </Text>
        )}
        <Text style={styles.instructionsText}>
          {`\u2022 For QR signing, on the Keystone, choose ${
            isMultisig ? 'multisig menu' : 'Generic Wallet section'
          }, press the scan icon on the top bar and wait for the QR to be scanned.`}
        </Text>
        <Text semiBold style={styles.instructionsText}>
          {'Sign transaction via:'}
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
              customStyle={{
                width: wp(95),
                height: hp(
                  supportedSigningOptions.some((opt) => opt.title.length > 10) ? 115 : 100
                ),
              }}
            />
          ))}
      </HStack>
    </Box>
  );
}

function JadeContent({
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
      <JadeSetup />
      <Box marginTop={2}>
        {isMultisig && (
          <Text style={styles.instructionsText}>
            {
              '\u2022 Make sure the multisig wallet is registered on the Jade before signing the transaction.'
            }
          </Text>
        )}
        <Text style={styles.instructionsText}>
          {signingMode === SigningMode.USB
            ? '\u2022 For signing via USB, connect the Jade to your computer and follow the instructions on the Keeper desktop app'
            : "\u2022 On the Jade main menu, choose the 'Scan QR' option and wait for the QR to be scanned."}
        </Text>
        <Text semiBold style={{ fontSize: 14, letterSpacing: 0.65, margin: 7 }}>
          {'Sign transaction via:'}
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
              customStyle={{
                width: wp(95),
                height: hp(
                  supportedSigningOptions.some((opt) => opt.title.length > 10) ? 115 : 100
                ),
              }}
            />
          ))}
      </HStack>
    </Box>
  );
}

function TrezorContent() {
  return (
    <Box alignItems="center">
      <TrezorSetup />
      <Box marginTop={2}>
        <Text style={styles.instructionsText}>
          {
            '\u2022 After downloading the desktop app, connect the Trezor to your computer and follow the instructions on the Keeper desktop app'
          }
        </Text>
      </Box>
    </Box>
  );
}

function BitBox02Content() {
  return (
    <Box alignItems="center">
      <BitoxImage />
      <Box marginTop={2}>
        <Text style={styles.instructionsText}>
          {
            '\u2022 After downloading the desktop app, connect the BitBox02 to your computer and follow the instructions on the Keeper desktop app'
          }
        </Text>
      </Box>
    </Box>
  );
}

function LedgerContent() {
  return (
    <Box alignItems="center">
      <LedgerImage />
      <Box marginTop={2}>
        <Text style={styles.instructionsText}>
          {
            '\u2022 After downloading the desktop app, connect the Ledger to your computer and follow the instructions on the Keeper desktop app'
          }
        </Text>
      </Box>
    </Box>
  );
}

function OtherSDContent() {
  return (
    <Box alignItems="center">
      <OtherSDImage />
      <Box marginTop={2}>
        <Text style={styles.instructionsText}>
          {'Either scan or use the export option to transfer the PSBT to the signer.'}
        </Text>
      </Box>
    </Box>
  );
}
export function KeeperContent(props) {
  return (
    <Box alignItems="center">
      <KeeperSetup />
      <Box marginTop={2}>
        <Text style={styles.instructionsText}>
          {`Open the other Keeper app > Go to Manage Keys > Access the key with the fingerprint ${props.masterFingerPrint} > Go to Settings > Sign a transaction`}
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
      <Instruction text="You will need the PIN (given at the back of the TAPSIGNER)." />
    </>
  );
}
function PortalContent() {
  return (
    <>
      <PortalIllustration />
      <Instruction text="Portal communicates with the app over NFC" />
      <Instruction text="You will need the CVC/ Pin, if you have set one." />
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
          {
            title: 'USB',
            icon: (
              <CircleIconWrapper
                icon={<USBIcon />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: SigningMode.USB,
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
    case SignerType.JADE:
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
            title: 'USB',
            icon: (
              <CircleIconWrapper
                icon={<USBIcon />}
                backgroundColor={`${colorMode}.BrownNeedHelp`}
                width={35}
              />
            ),
            name: SigningMode.USB,
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
  portalModal,
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
  setPortalModal,
  signTransaction,
  vaultKeys,
  isMultisig,
  signerMap,
  specterModal,
  setSpecterModal,
  onFileSign,
  isRemoteKey = false,
  serializedPSBTEnvelopFromProps,
  sendConfirmationRouteParams,
  tnxDetails,
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
  portalModal: boolean;
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
  setPortalModal: any;
  signTransaction: any;
  vaultKeys: VaultSigner[];
  isMultisig: boolean;
  signerMap: { [key: string]: Signer };
  specterModal: boolean;
  setSpecterModal: any;
  onFileSign: any;
  isRemoteKey: boolean;
  serializedPSBTEnvelopFromProps?: SerializedPSBTEnvelop;
  sendConfirmationRouteParams?: SendConfirmationRouteParams;
  tnxDetails?: tnxDetailsProps;
}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const serializedPSBTEnvelop: SerializedPSBTEnvelop = isRemoteKey
    ? serializedPSBTEnvelopFromProps
    : serializedPSBTEnvelops?.filter((envelop) => envelop.xfp === activeXfp)[0];

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
        isRemoteKey: isRemoteKey,
        serializedPSBTEnvelopFromProps,
        isMultisig: isMultisig,
        sendConfirmationRouteParams,
        tnxDetails,
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
        isRemoteKey,
        serializedPSBTEnvelopFromProps,
        isMultisig,
      })
    );
  };
  return (
    <>
      {vaultKeys.map((vaultKey) => {
        const signer = signerMap[getKeyUID(vaultKey)];
        const currentSigner = vaultKey.xfp === activeXfp;
        const { supportedSigningOptions } = getSupportedSigningOptions(signer.type, colorMode);
        const [signingMode, setSigningMode] = useState<SigningMode>(
          supportedSigningOptions[0]?.name || null
        );
        const info = vaultKey.registeredVaults.find((info) => info.vaultId === vaultId);

        if (signer.type === SignerType.TAPSIGNER) {
          const navigateToSignWithTapsigner = () => {
            setTapsignerModal(false);
            navigation.dispatch(
              CommonActions.navigate('TapsignerAction', {
                mode: InteracationMode.SIGN_TRANSACTION,
                signer,
                isMultisig,
                accountNumber: getAccountFromSigner(signer),
                signTransaction,
                isRemoteKey,
              })
            );
          };
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && tapsignerModal}
              close={() => setTapsignerModal(false)}
              title="Get your TAPSIGNER ready"
              subTitle="Get your TAPSIGNER ready before proceeding"
              buttonText="Proceed"
              buttonCallback={navigateToSignWithTapsigner}
              Content={() => <TapsignerContent />}
            />
          );
        }
        if (signer.type === SignerType.COLDCARD) {
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
                    fileType: 'PSBT',
                    signerType: signer.type,
                  },
                })
              );
              return;
            } else if (signingMode === SigningMode.USB) {
              navigateToChannelSigning(vaultKey, SignerType.COLDCARD);
            } else {
              navigation.dispatch(
                CommonActions.navigate('SignWithColdCard', {
                  signTransaction,
                  vaultKey,
                  isMultisig,
                  vaultId,
                  isRemoteKey,
                })
              );
            }
          };
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && coldCardModal}
              close={() => setColdCardModal(false)}
              title={'Get your Coldcard ready'}
              subTitle="Get your Coldcard ready before proceeding"
              Content={() => (
                <ColdCardContent
                  register={isMultisig && !info?.registered}
                  isMultisig={isMultisig}
                  supportedSigningOptions={supportedSigningOptions}
                  onSelect={(mode) => {
                    setSigningMode(mode);
                  }}
                  signingMode={signingMode}
                />
              )}
              buttonText={'Start Signing'}
              buttonCallback={navigateToSignWithColdCard}
              secondaryButtonText={
                isMultisig && !isRemoteKey && !info?.registered ? 'Register multisig' : null
              }
              secondaryCallback={() => {
                setColdCardModal(false);
                navigation.dispatch(
                  CommonActions.navigate('RegisterWithQR', { vaultKey, vaultId })
                );
              }}
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
              title="Get your Ledger Ready"
              subTitle={`Please download the Bitcoin Keeper desktop app from our website: ${KEEPER_WEBSITE_BASE_URL}/desktop to connect with Ledger.`}
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
              subTitle="Get your Foundation Passport ready before proceeding"
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
              buttonText={'Start Signing'}
              secondaryButtonText={
                isMultisig && !isRemoteKey && !info?.registered ? 'Register multisig' : null
              }
              secondaryCallback={() => {
                setPassportModal(false);
                navigation.dispatch(
                  CommonActions.navigate('RegisterWithQR', { vaultKey, vaultId })
                );
              }}
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
                        fileType: 'PSBT',
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
              subTitle="Get your SeedSigner ready before proceeding"
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
              subTitle="Get your Specter ready before proceeding"
              textColor={`${colorMode}.primaryText`}
              Content={() => <SpecterContent isMultisig={isMultisig} />}
              buttonText={'Start Signing'}
              secondaryButtonText={
                isMultisig && !isRemoteKey && !info?.registered ? 'Register multisig' : null
              }
              secondaryCallback={() => {
                setKeeperModal(false);
                navigation.dispatch(
                  CommonActions.navigate('RegisterWithQR', { vaultKey, vaultId })
                );
              }}
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
              subTitle="Get your Keystone ready before proceeding"
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
              buttonText={'Start Signing'}
              secondaryButtonText={
                isMultisig && !isRemoteKey && !info?.registered ? 'Register multisig' : null
              }
              secondaryCallback={() => {
                setKeystoneModal(false);
                navigation.dispatch(
                  CommonActions.navigate('RegisterWithQR', { vaultKey, vaultId })
                );
              }}
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
                        fileType: 'PSBT',
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
              subTitle="Get your Jade ready before proceeding"
              textColor={`${colorMode}.primaryText`}
              Content={() => (
                <JadeContent
                  isMultisig={isMultisig}
                  supportedSigningOptions={supportedSigningOptions}
                  onSelect={(mode) => {
                    setSigningMode(mode);
                  }}
                  signingMode={signingMode}
                />
              )}
              buttonText={'Start Signing'}
              secondaryButtonText={
                isMultisig && !isRemoteKey && !info?.registered ? 'Register multisig' : null
              }
              secondaryCallback={() => {
                setJadeModal(false);
                navigation.dispatch(
                  CommonActions.navigate('RegisterWithQR', { vaultKey, vaultId })
                );
              }}
              buttonCallback={() => {
                setJadeModal(false);
                if (signingMode === SigningMode.USB) {
                  navigateToChannelSigning(vaultKey, SignerType.JADE);
                } else {
                  navigateToQrSigning(vaultKey);
                }
              }}
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
              subTitle={`Please download the Bitcoin Keeper desktop app from our website: ${KEEPER_WEBSITE_BASE_URL}/desktop to connect with Trezor.`}
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
              subTitle={`Please download the Bitcoin Keeper desktop app from our website: ${KEEPER_WEBSITE_BASE_URL}/desktop to connect with BitBox02.`}
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
              subTitle="Get your Signer ready before proceeding"
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
              title="Get your Device Ready"
              subTitle={`Get your ${getSignerNameFromType(signer.type)} ready before proceeding`}
              textColor={`${colorMode}.primaryText`}
              Content={() => (
                <KeeperContent masterFingerPrint={signer && signer.masterFingerprint} />
              )}
              buttonText="Proceed"
              buttonCallback={() => navigateToQrSigning(vaultKey)}
            />
          );
        }
        if (signer.type === SignerType.PORTAL) {
          const navigateToSignWithPortal = () => {
            setPortalModal(false);
            navigation.dispatch(
              CommonActions.navigate('SetupPortal', {
                mode: InteracationMode.SIGN_TRANSACTION,
                signer,
                isMultisig,
                signTransaction,
                isRemoteKey,
                accountNumber: getAccountFromSigner(signer),
              })
            );
          };
          return (
            <KeeperModal
              key={vaultKey.xfp}
              visible={currentSigner && portalModal}
              close={() => setPortalModal(false)}
              title="Keep your Portal ready"
              subTitle="Keep your Portal ready before proceeding"
              buttonText="Proceed"
              buttonCallback={navigateToSignWithPortal}
              secondaryButtonText={
                isMultisig && !isRemoteKey && !info?.registered ? 'Register multisig' : null
              }
              secondaryCallback={() => {
                setPortalModal(false);
                navigation.dispatch(
                  CommonActions.navigate('SetupPortal', {
                    vaultKey,
                    vaultId,
                    mode: InteracationMode.VAULT_REGISTER,
                    accountNumber: getAccountFromSigner(vaultKey),
                  })
                );
              }}
              Content={() => <PortalContent />}
            />
          );
        }
        return null;
      })}
    </>
  );
}

export default SignerModals;

const styles = StyleSheet.create({
  instructionsText: {
    fontSize: 14,
    marginHorizontal: wp(5),
    marginTop: wp(3),
    marginBottom: wp(10),
  },
});
