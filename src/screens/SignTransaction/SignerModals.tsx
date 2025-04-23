import { Alert, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { hp, wp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import ColdCardSVG from 'src/assets/images/ColdCardSetup.svg';
import JadeSetup from 'src/assets/images/illustration_jade.svg';
import KeeperSetup from 'src/assets/images/illustration_ksd.svg';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import KeystoneSetup from 'src/assets/images/keystone_illustration.svg';
import LoginMethod from 'src/models/enums/LoginMethod';
import PassportSVG from 'src/assets/images/illustration_passport.svg';
import PortalIllustration from 'src/assets/images/portal_illustration.svg';
import ReactNativeBiometrics from 'react-native-biometrics';
import SeedSignerSetup from 'src/assets/images/seedsigner-setup-horizontal.svg';
import SpecterSetupImage from 'src/assets/images/illustration_spectre.svg';
import { RKInteractionMode, SignerType, SigningMode } from 'src/services/wallets/enums';
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
import { SerializedPSBTEnvelop } from 'src/services/wallets/interfaces';
import { InteracationMode } from '../Vault/HardwareModalMap';
import { SendConfirmationRouteParams, tnxDetailsProps } from '../Send/SendConfirmation';
import { getAccountFromSigner, getKeyUID } from 'src/utils/utilities';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import SignerOptionCard from '../Vault/components/signerOptionCard';
import ColdCardUSBInstruction from '../Vault/components/ColdCardUSBInstruction';
import ShareKeyModalContent from '../Vault/components/ShareKeyModalContent';
import MagicLinkIcon from 'src/assets/images/magic-link-icon.svg';
import useVault from 'src/hooks/useVault';
import RegisterMultisig from './component/RegisterMultisig';

const RNBiometrics = new ReactNativeBiometrics();

function ColdCardContent({
  isMultisig,
  signingMode,
}: {
  isMultisig: boolean;
  signingMode: SigningMode;
}) {
  let message = '';

  if (isMultisig) {
    message =
      'Make sure the multisig wallet is registered with the Coldcard before signing the transaction';
  }

  if (signingMode === SigningMode.USB) {
    return <ColdCardUSBInstruction />;
  } else {
    return (
      <Box alignItems="center">
        <ColdCardSVG />
        <Box marginTop={4}>
          <Instruction text={message} />
        </Box>
      </Box>
    );
  }
}

function PassportContent({ isMultisig }: { isMultisig: boolean }) {
  return (
    <Box alignItems="center">
      <PassportSVG />
      <Box marginTop={4}>
        {isMultisig && (
          <Instruction text="Make sure the multisig wallet is registered with the Passport before signing the transaction." />
        )}
        <Instruction text="For QR signing, on the Passport main menu, choose the 'Sign with QR Code' option." />
      </Box>
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

function KeystoneContent({ isMultisig }: { isMultisig: boolean }) {
  return (
    <Box alignItems="center">
      <KeystoneSetup />
      <Box marginTop={4}>
        {isMultisig && (
          <Instruction text="Make sure the multisig wallet is registered with the Keystone before signing the transaction." />
        )}
        <Instruction
          text={`For QR signing, on the Keystone, choose ${
            isMultisig ? 'multisig menu' : 'Generic Wallet section'
          }, press the scan icon on the top bar and wait for the QR to be scanned.`}
        />
      </Box>
    </Box>
  );
}

function JadeContent({
  isMultisig,
  signingMode,
}: {
  isMultisig: boolean;
  signingMode: SigningMode;
}) {
  if (signingMode === SigningMode.USB) {
    return <ColdCardUSBInstruction />;
  }
  return (
    <Box alignItems="center">
      <JadeSetup />
      <Box marginTop={2}>
        {isMultisig && (
          <Instruction text="Make sure the multisig wallet is registered with the Jade before signing the transaction." />
        )}
        <Instruction text="On the Jade main menu, choose the 'Scan QR' option and wait for the QR to be scanned." />
      </Box>
    </Box>
  );
}

function TrezorContent() {
  return (
    <Box alignItems="center">
      <ColdCardUSBInstruction />
    </Box>
  );
}

function BitBox02Content() {
  return (
    <Box alignItems="center">
      <ColdCardUSBInstruction />
    </Box>
  );
}

function LedgerContent() {
  return (
    <Box alignItems="center">
      <ColdCardUSBInstruction />
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
          {`Open the other Keeper app > Go to Manage Keys > Access the key with the fingerprint ${props.masterFingerPrint} > Sign Transaction`}
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
      <Box style={styles.portalIllustration}>
        <PortalIllustration />
      </Box>
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
        <CVVInputsView
          passCode={otp}
          passcodeFlag={false}
          backgroundColor
          textColor
          height={hp(46)}
          width={hp(46)}
          marginTop={hp(0)}
          marginBottom={hp(20)}
          inputGap={2}
          customStyle={styles.CVVInputsView}
        />
      </Box>
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={`${colorMode}.primaryText`}
        ClearIcon={<DeleteIcon />}
      />
      <Box mt={5} alignSelf="flex-end" mr={2}>
        <Box>
          <Buttons
            primaryCallback={() => {
              signTransaction({ signingServerOTP: otp });
            }}
            fullWidth
            primaryText="Proceed"
            primaryDisable={otp.length !== 6}
          />
        </Box>
      </Box>
    </Box>
  );
}

const getSupportedSigningOptions = (signerType: SignerType, colorMode) => {
  switch (signerType) {
    case SignerType.COLDCARD:
      return {
        supportedSigningOptions: [
          {
            title: 'QR',
            icon: (
              <CircleIconWrapper
                icon={<QRComms />}
                backgroundColor={`${colorMode}.pantoneGreen`}
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
                backgroundColor={`${colorMode}.pantoneGreen`}
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
                backgroundColor={`${colorMode}.pantoneGreen`}
                width={35}
              />
            ),
            name: SigningMode.USB,
          },
          {
            title: 'NFC',
            icon: (
              <CircleIconWrapper
                icon={<NfcComms />}
                backgroundColor={`${colorMode}.pantoneGreen`}
                width={35}
              />
            ),
            name: SigningMode.NFC,
          },
        ],
      };
    case SignerType.KEEPER:
      return {
        supportedSigningOptions: [
          {
            title: 'Magic Link',
            icon: (
              <CircleIconWrapper
                icon={<MagicLinkIcon />}
                backgroundColor={`${colorMode}.pantoneGreen`}
                width={35}
              />
            ),
            name: 'MAGIC_LINK',
          },
          {
            title: 'QR',
            icon: (
              <CircleIconWrapper
                icon={<QRComms />}
                backgroundColor={`${colorMode}.pantoneGreen`}
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
                backgroundColor={`${colorMode}.pantoneGreen`}
                width={35}
              />
            ),
            name: SigningMode.FILE,
          },
          {
            title: 'NFC',
            icon: (
              <CircleIconWrapper
                icon={<NfcComms />}
                backgroundColor={`${colorMode}.pantoneGreen`}
                width={35}
              />
            ),
            name: SigningMode.NFC,
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
                backgroundColor={`${colorMode}.pantoneGreen`}
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
                backgroundColor={`${colorMode}.pantoneGreen`}
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
                backgroundColor={`${colorMode}.pantoneGreen`}
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
                backgroundColor={`${colorMode}.pantoneGreen`}
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
  isMiniscript,
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
  isMiniscript?: boolean;
}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const serializedPSBTEnvelop: SerializedPSBTEnvelop = isRemoteKey
    ? serializedPSBTEnvelopFromProps
    : serializedPSBTEnvelops?.filter((envelop) => envelop.xfp === activeXfp)[0];

  const [coldCardContentModal, setColdCardContentModal] = useState(false);
  const [passportContentModal, setPassportContentModal] = useState(false);
  const [keystoneContentModal, setKeystoneContentModal] = useState(false);
  const [jadeModalContent, setJadeModalContent] = useState(false);
  const [keeperModalContent, setKeeperModalContent] = useState(false);
  const [otherModalContent, setOtherModalContent] = useState(false);
  const [keeperContentModal, setKeeperContentModal] = useState(false);
  const [registerSignerModal, setRegisterSignerModal] = useState(false);

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
  const [registeredSigner, setRegisteredSigner] = useState(null);
  const [registeredVaultKey, setRegisteredVaultKey] = useState(null);
  const [registerActiveVault, setRegisterActiveVault] = useState(null);

  const openRegisterModal = (signer, vaultKey, activeVault) => {
    setRegisteredSigner(signer);
    setRegisteredVaultKey(vaultKey);
    setRegisterSignerModal(true);
    setRegisterActiveVault(activeVault);
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
        const { activeVault } = useVault({ vaultId, includeArchived: false });

        const info = vaultKey.registeredVaults?.find((info) => info.vaultId === vaultId);
        function OptionModalContent({
          supportedSigningOptions,
          onSelect,
          signingMode,
        }: {
          options?: any;
          supportedSigningOptions: any[];
          onSelect: (option) => any;
          signingMode: SigningMode;
        }) {
          return (
            <Box style={styles.optionModalContent}>
              {supportedSigningOptions &&
                supportedSigningOptions.map((option) => (
                  <SignerOptionCard
                    key={option.name}
                    isSelected={signingMode === option.name}
                    name={option.title}
                    icon={option.icon}
                    onCardSelect={() => {
                      onSelect(option.name);

                      if (option.name !== 'MAGIC_LINK') {
                        if (signer.type === SignerType.PASSPORT) {
                          setPassportContentModal(true);
                          setPassportModal(false);
                        } else if (signer.type === SignerType.KEYSTONE) {
                          setKeystoneContentModal(true);
                          setKeystoneModal(false);
                        } else if (signer.type === SignerType.JADE) {
                          setJadeModalContent(true);
                          setJadeModal(false);
                        } else if (signer.type === SignerType.KEEPER) {
                          setKeeperModalContent(true);
                          setKeeperModal(false);
                        } else {
                          setColdCardContentModal(true);
                          setColdCardModal(false);
                        }
                      } else {
                        setKeeperModal(false);
                        navigation.dispatch(
                          CommonActions.navigate('RemoteSharing', {
                            psbt: serializedPSBTEnvelop.serializedPSBT,
                            mode: RKInteractionMode.SHARE_PSBT,
                            signer: signer,
                            xfp: vaultKey.xfp,
                          })
                        );
                      }
                    }}
                  />
                ))}
            </Box>
          );
        }
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
            setColdCardContentModal(false);
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
            } else if (signingMode === SigningMode.QR) {
              navigateToQrSigning(vaultKey);
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
            <>
              <KeeperModal
                visible={currentSigner && coldCardModal}
                close={() => setColdCardModal(false)}
                title={'Get your Coldcard ready'}
                subTitle="Choose how you want to sign the transaction"
                modalBackground={`${colorMode}.modalWhiteBackground`}
                textColor={`${colorMode}.textGreen`}
                subTitleColor={`${colorMode}.modalSubtitleBlack`}
                Content={() => (
                  <OptionModalContent
                    supportedSigningOptions={supportedSigningOptions}
                    onSelect={(mode) => {
                      setSigningMode(mode);
                    }}
                    signingMode={signingMode}
                  />
                )}
              />

              <KeeperModal
                key={vaultKey.xfp}
                visible={coldCardContentModal}
                close={() => setColdCardContentModal(false)}
                title={'Signing with ' + signingMode}
                subTitle="Get your Coldcard ready before proceeding"
                modalBackground={`${colorMode}.modalWhiteBackground`}
                textColor={`${colorMode}.textGreen`}
                subTitleColor={`${colorMode}.modalSubtitleBlack`}
                Content={() => (
                  <ColdCardContent isMultisig={isMultisig} signingMode={signingMode} />
                )}
                buttonText={'Start Signing'}
                buttonCallback={navigateToSignWithColdCard}
                secondaryButtonText={
                  signingMode !== SigningMode.USB && isMultisig && !isRemoteKey && !info?.registered
                    ? 'Register multisig'
                    : null
                }
                secondaryCallback={() => {
                  setColdCardContentModal(false);
                  openRegisterModal(signer, vaultKey, activeVault);
                }}
              />
            </>
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
              subTitle={`Connect the Legger to your computer and open the Bitcoin Keeper desktop app`}
              textColor={`${colorMode}.textGreen`}
              subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
              textColor={`${colorMode}.textGreen`}
              subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
              title={common.confirm2FACodeTitle}
              subTitle={common.confirm2FACodeSubtitle}
              textColor={`${colorMode}.textGreen`}
              subTitleColor={`${colorMode}.modalSubtitleBlack`}
              Content={() => <OtpContent signTransaction={signTransaction} />}
            />
          );
        }
        if (signer.type === SignerType.PASSPORT) {
          return (
            <>
              <KeeperModal
                visible={currentSigner && passportModal}
                close={() => setPassportModal(false)}
                title={'Keep Passport Ready'}
                subTitle="Choose how you want to sign the transaction"
                modalBackground={`${colorMode}.modalWhiteBackground`}
                textColor={`${colorMode}.textGreen`}
                subTitleColor={`${colorMode}.modalSubtitleBlack`}
                Content={() => (
                  <OptionModalContent
                    supportedSigningOptions={supportedSigningOptions}
                    onSelect={(mode) => {
                      setSigningMode(mode);
                    }}
                    signingMode={signingMode}
                  />
                )}
              />
              <KeeperModal
                key={vaultKey.xfp}
                visible={passportContentModal}
                close={() => {
                  setPassportContentModal(false);
                }}
                title={'Signing with ' + signingMode}
                subTitle="Get your Foundation Passport ready before proceeding"
                modalBackground={`${colorMode}.modalWhiteBackground`}
                textColor={`${colorMode}.textGreen`}
                subTitleColor={`${colorMode}.modalSubtitleBlack`}
                Content={() => <PassportContent isMultisig={isMultisig} />}
                buttonText={'Start Signing'}
                secondaryButtonText={
                  isMultisig && !isRemoteKey && !info?.registered ? 'Register multisig' : null
                }
                secondaryCallback={() => {
                  setPassportContentModal(false);
                  openRegisterModal(signer, vaultKey, activeVault);
                }}
                buttonCallback={() => {
                  setPassportContentModal(false);
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
            </>
          );
        }
        if (signer.type === SignerType.SEEDSIGNER) {
          return (
            <>
              <KeeperModal
                key={vaultKey.xfp}
                visible={currentSigner && seedSignerModal}
                close={() => setSeedSignerModal(false)}
                title={'Keep SeedSigner Ready'}
                subTitle="Get your SeedSigner ready before proceeding"
                modalBackground={`${colorMode}.modalWhiteBackground`}
                textColor={`${colorMode}.textGreen`}
                subTitleColor={`${colorMode}.modalSubtitleBlack`}
                Content={() => <SeedSignerContent isMultisig={isMultisig} />}
                buttonText="Proceed"
                buttonCallback={() => {
                  navigateToQrSigning(vaultKey);
                  setSeedSignerModal(false);
                }}
              />
            </>
          );
        }
        if (signer.type === SignerType.SPECTER) {
          return (
            <>
              <KeeperModal
                key={vaultKey.xfp}
                visible={currentSigner && specterModal}
                close={() => {
                  setSpecterModal(false);
                }}
                title="Keep Specter Ready"
                subTitle="Get your Specter ready before proceeding"
                textColor={`${colorMode}.textGreen`}
                Content={() => <SpecterContent isMultisig={isMultisig} />}
                buttonText={'Start Signing'}
                secondaryButtonText={
                  isMultisig && !isRemoteKey && !info?.registered ? 'Register multisig' : null
                }
                secondaryCallback={() => {
                  setSpecterModal(false);
                  openRegisterModal(signer, vaultKey, activeVault);
                }}
                buttonCallback={() => navigateToQrSigning(vaultKey)}
              />
            </>
          );
        }
        if (signer.type === SignerType.KEYSTONE) {
          return (
            <>
              <KeeperModal
                visible={currentSigner && keystoneModal}
                close={() => setKeystoneModal(false)}
                title={'Keep Keystone Ready'}
                subTitle="Choose how you want to sign the transaction"
                modalBackground={`${colorMode}.modalWhiteBackground`}
                textColor={`${colorMode}.textGreen`}
                subTitleColor={`${colorMode}.modalSubtitleBlack`}
                Content={() => (
                  <OptionModalContent
                    supportedSigningOptions={supportedSigningOptions}
                    onSelect={(mode) => {
                      setSigningMode(mode);
                    }}
                    signingMode={signingMode}
                  />
                )}
              />
              <KeeperModal
                key={vaultKey.xfp}
                visible={keystoneContentModal}
                close={() => {
                  setKeystoneContentModal(false);
                }}
                title={'Signing with ' + signingMode}
                subTitle="Get your Keystone ready before proceeding"
                textColor={`${colorMode}.textGreen`}
                Content={() => <KeystoneContent isMultisig={isMultisig} />}
                buttonText={'Start Signing'}
                secondaryButtonText={
                  isMultisig && !isRemoteKey && !info?.registered ? 'Register multisig' : null
                }
                secondaryCallback={() => {
                  setKeystoneContentModal(false);
                  openRegisterModal(signer, vaultKey, activeVault);
                }}
                buttonCallback={() => {
                  setKeystoneContentModal(false);
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
                          signingMode,
                        },
                      })
                    );
                    return;
                  }
                  navigateToQrSigning(vaultKey);
                }}
              />
            </>
          );
        }
        if (signer.type === SignerType.JADE) {
          return (
            <>
              <KeeperModal
                visible={currentSigner && jadeModal}
                close={() => setJadeModal(false)}
                title={'Keep Jade Ready'}
                subTitle="Choose how you want to sign the transaction"
                modalBackground={`${colorMode}.modalWhiteBackground`}
                textColor={`${colorMode}.textGreen`}
                subTitleColor={`${colorMode}.modalSubtitleBlack`}
                Content={() => (
                  <OptionModalContent
                    supportedSigningOptions={supportedSigningOptions}
                    onSelect={(mode) => {
                      setSigningMode(mode);
                    }}
                    signingMode={signingMode}
                  />
                )}
              />
              <KeeperModal
                key={vaultKey.xfp}
                visible={jadeModalContent}
                close={() => {
                  setJadeModalContent(false);
                }}
                title="Keep Jade Ready"
                subTitle="Get your Jade ready before proceeding"
                textColor={`${colorMode}.textGreen`}
                Content={() => <JadeContent signingMode={signingMode} isMultisig={isMultisig} />}
                buttonText={'Start Signing'}
                secondaryButtonText={
                  signingMode !== SigningMode.USB && isMultisig && !isRemoteKey && !info?.registered
                    ? 'Register multisig'
                    : null
                }
                secondaryCallback={() => {
                  setJadeModalContent(false);
                  openRegisterModal(signer, vaultKey, activeVault);
                }}
                buttonCallback={() => {
                  setJadeModalContent(false);
                  if (signingMode === SigningMode.USB) {
                    navigateToChannelSigning(vaultKey, SignerType.JADE);
                  } else {
                    navigateToQrSigning(vaultKey);
                  }
                }}
              />
            </>
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
              subTitle={`Connect the Trezor to your computer and open the Bitcoin Keeper desktop app`}
              textColor={`${colorMode}.textGreen`}
              subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
              subTitle={`Keep your BitBox02 connected to the computer before proceeding.`}
              textColor={`${colorMode}.textGreen`}
              subTitleColor={`${colorMode}.modalSubtitleBlack`}
              Content={() => <BitBox02Content />}
              buttonText="Proceed"
              buttonCallback={() => navigateToChannelSigning(vaultKey, signer.type)}
            />
          );
        }
        if (signer.type === SignerType.OTHER_SD) {
          return (
            <>
              <KeeperModal
                visible={currentSigner && otherSDModal}
                close={() => {
                  setOtherSDModal(false);
                }}
                title="Keep the Signer Ready"
                subTitle="Choose one of the following options"
                modalBackground={`${colorMode}.modalWhiteBackground`}
                textColor={`${colorMode}.textGreen`}
                subTitleColor={`${colorMode}.modalSubtitleBlack`}
                Content={() => (
                  <ShareKeyModalContent
                    navigation={navigation}
                    signer={signer}
                    vaultId={vaultId}
                    vaultKey={vaultKey}
                    setShareKeyModal={setOtherSDModal}
                    openmodal={setOtherModalContent}
                    data={serializedPSBTEnvelop}
                    isPSBTSharing
                    xfp={vaultKey?.xfp}
                  />
                )}
              />
              <KeeperModal
                key={vaultKey.xfp}
                visible={otherModalContent}
                close={() => {
                  setOtherModalContent(false);
                }}
                title="Keep the Signer Ready"
                subTitle="Get your Signer ready before proceeding"
                textColor={`${colorMode}.textGreen`}
                subTitleColor={`${colorMode}.modalSubtitleBlack`}
                Content={() => <OtherSDContent />}
                buttonText="Proceed"
                buttonCallback={() => {
                  setOtherSDModal(false);
                  navigateToQrSigning(vaultKey);
                }}
              />
            </>
          );
        }
        if (signer.type === SignerType.UNKOWN_SIGNER) {
          return (
            <>
              <KeeperModal
                visible={currentSigner && keeperModal}
                close={() => {
                  setKeeperModal(false);
                }}
                title="Get your Device Ready"
                subTitle="Choose one of the following options"
                modalBackground={`${colorMode}.modalWhiteBackground`}
                textColor={`${colorMode}.textGreen`}
                subTitleColor={`${colorMode}.modalSubtitleBlack`}
                Content={() => (
                  <ShareKeyModalContent
                    navigation={navigation}
                    signer={signer}
                    vaultId={vaultId}
                    vaultKey={vaultKey}
                    setShareKeyModal={setKeeperModal}
                    openmodal={setKeeperContentModal}
                    data={serializedPSBTEnvelop}
                    isPSBTSharing
                    xfp={vaultKey?.xfp}
                  />
                )}
              />
              <KeeperModal
                key={vaultKey.xfp}
                visible={keeperContentModal}
                close={() => {
                  setKeeperContentModal(false);
                }}
                title="Get your Device Ready"
                subTitle={`Get your ${getSignerNameFromType(signer.type)} ready before proceeding`}
                textColor={`${colorMode}.textGreen`}
                subTitleColor={`${colorMode}.modalSubtitleBlack`}
                Content={() => (
                  <KeeperContent masterFingerPrint={signer && signer.masterFingerprint} />
                )}
                buttonText="Proceed"
                buttonCallback={() => {
                  setKeeperModal(false);
                  navigateToQrSigning(vaultKey);
                }}
              />
            </>
          );
        }
        if (signer.type === SignerType.KEEPER) {
          const navigateToSignWithKeeper = () => {
            setKeeperModalContent(false);
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
                    signingMode,
                  },
                })
              );
              return;
            } else if (signingMode === SigningMode.QR) {
              navigateToQrSigning(vaultKey);
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
            <>
              <KeeperModal
                visible={currentSigner && keeperModal}
                close={() => setKeeperModal(false)}
                title={'Get your Device Ready'}
                subTitle="Choose how you want to sign the transaction"
                modalBackground={`${colorMode}.modalWhiteBackground`}
                textColor={`${colorMode}.textGreen`}
                subTitleColor={`${colorMode}.modalSubtitleBlack`}
                Content={() => (
                  <OptionModalContent
                    supportedSigningOptions={supportedSigningOptions}
                    onSelect={(mode) => {
                      setSigningMode(mode);
                    }}
                    signingMode={signingMode}
                  />
                )}
              />
              <KeeperModal
                key={vaultKey.xfp}
                visible={keeperModalContent}
                close={() => {
                  setKeeperModalContent(false);
                }}
                title="Get your Device Ready"
                subTitle={`Get your ${getSignerNameFromType(signer.type)} ready before proceeding`}
                textColor={`${colorMode}.textGreen`}
                subTitleColor={`${colorMode}.modalSubtitleBlack`}
                Content={() => (
                  <KeeperContent masterFingerPrint={signer && signer.masterFingerprint} />
                )}
                buttonText="Proceed"
                buttonCallback={navigateToSignWithKeeper}
                secondaryButtonText={
                  isMultisig && !isRemoteKey && !info?.registered ? 'Register multisig' : null
                }
                secondaryCallback={() => {
                  setKeeperModalContent(false);
                  openRegisterModal(signer, vaultKey, activeVault);
                }}
              />
            </>
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
              modalBackground={`${colorMode}.modalWhiteBackground`}
              textColor={`${colorMode}.textGreen`}
              subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
      {registerSignerModal && registeredSigner && (
        <KeeperModal
          visible={registerSignerModal}
          close={() => setRegisterSignerModal(false)}
          title="Register multisig"
          subTitle="Register your active vault"
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.textGreen`}
          subTitleColor={`${colorMode}.modalSubtitleBlack`}
          Content={() => (
            <RegisterMultisig
              isUSBAvailable={
                registeredSigner.type === SignerType.COLDCARD ||
                (registeredSigner.type === SignerType.JADE && isMiniscript)
              }
              signer={registeredSigner}
              vaultId={vaultId}
              vaultKey={registeredVaultKey}
              setRegisterSignerModal={setRegisterSignerModal}
              activeVault={registerActiveVault}
              navigation={navigation}
              CommonActions={CommonActions}
            />
          )}
        />
      )}
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
  setupOptionsContainer: {
    gap: wp(11),
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  supportedMediumCardStyle: {
    width: '48%',
    paddingTop: hp(14),
    paddingBottom: hp(9),
    paddingLeft: wp(12),
    paddingRight: wp(14),
  },
  CVVInputsView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionModalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(10),
  },
  portalIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(10),
  },
});
