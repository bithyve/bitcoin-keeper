import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import useSignerMap from 'src/hooks/useSignerMap';
import SignerModals from '../screens/SignTransaction/SignerModals';
import { ScriptTypes, SignerType, XpubTypes } from 'src/services/wallets/enums';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  signTransactionWithColdCard,
  signTransactionWithPortal,
  signTransactionWithSeedWords,
  signTransactionWithTapsigner,
} from '../screens/SignTransaction/signWithSD';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import { CKTapCard } from 'cktap-protocol-react-native';
import useNfcModal from 'src/hooks/useNfcModal';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import KeeperModal from 'src/components/KeeperModal';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { useColorMode } from 'native-base';
import { SIGNTRANSACTION } from 'src/navigation/contants';
import { useDispatch } from 'react-redux';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import { getTxHexFromKeystonePSBT } from 'src/hardware/keystone';
import config from 'src/utils/service-utilities/config';
import useToastMessage from 'src/hooks/useToastMessage';
import { getCosignerDetails, signCosignerPSBT } from 'src/services/wallets/factories/WalletFactory';
import { getInputsFromPSBT, getInputsToSignFromPSBT } from 'src/utils/utilities';
import * as bitcoin from 'bitcoinjs-lib';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';

const RKSignersModal = ({ signer, psbt, isMiniscript, vaultId }, ref) => {
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];

  const serializedPSBTEnvelop = {
    serializedPSBT: psbt,
  };
  const isMultisig = true;

  const { colorMode } = useColorMode();

  const [coldCardModal, setColdCardModal] = useState(false);
  const [passportModal, setPassportModal] = useState(false);
  const [ledgerModal, setLedgerModal] = useState(false);
  const [trezorModal, setTrezorModal] = useState(false);
  const [bitbox02modal, setBitbox02modal] = useState(false);
  const [seedSignerModal, setSeedSignerModal] = useState(false);
  const [keystoneModal, setKeystoneModal] = useState(false);
  const [jadeModal, setJadeModal] = useState(false);
  const [specterModal, setSpecterModal] = useState(false);
  const [tapsignerModal, setTapsignerModal] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [portalModal, setPortalModal] = useState(false);

  const card = useRef(new CKTapCard()).current;
  const { withModal, nfcVisible: TSNfcVisible } = useTapsignerModal(card);
  const { withNfcModal, nfcVisible, closeNfc } = useNfcModal();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const textRef = useRef(null);
  const { signerMap } = useSignerMap();
  const signerType = signer.type;
  const navigation = useNavigation();

  useImperativeHandle(ref, () => {
    return {
      openModal() {
        selectWalletModal();
      },
    };
  });

  const selectWalletModal = () => {
    switch (signerType) {
      case SignerType.COLDCARD:
        setColdCardModal(true);
        break;
      case SignerType.PASSPORT:
        setPassportModal(true);
        break;
      case SignerType.LEDGER:
        setLedgerModal(true);
        break;
      case SignerType.TREZOR:
        setTrezorModal(true);
        break;
      case SignerType.BITBOX02:
        setBitbox02modal(true);
        break;
      case SignerType.KEYSTONE:
        setKeystoneModal(true);
        break;
      case SignerType.JADE:
        setJadeModal(true);
        break;
      case SignerType.SEEDSIGNER:
        setSeedSignerModal(true);
        break;
      case SignerType.SPECTER:
        setSpecterModal(true);
        break;
      case SignerType.TAPSIGNER:
        setTapsignerModal(true);
        break;
      case SignerType.MY_KEEPER:
        setConfirmPassVisible(true);
        break;
      case SignerType.PORTAL:
        setPortalModal(true);
        break;
      case SignerType.SEED_WORDS:
        navigation.dispatch(
          CommonActions.navigate({
            name: 'EnterSeedScreen',
            params: {
              parentScreen: SIGNTRANSACTION,
              xfp: vaultKeys.xfp,
              onSuccess: signTransaction,
            },
          })
        );
      default:
        break;
    }
  };

  const navigateToShowPSBT = (signedSerializedPSBT: string) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ShowPSBT',
        params: {
          data: signedSerializedPSBT,
          encodeToBytes: false,
          title: 'Signed PSBT',
          subtitle: 'Please scan until all the QR data has been retrieved',
          type: SignerType.KEEPER,
        },
      })
    );
  };

  const signTransaction = async ({ seedBasedSingerMnemonic, tapsignerCVC, portalCVC }) => {
    try {
      if (SignerType.SEED_WORDS === signerType) {
        const { signedSerializedPSBT } = await signTransactionWithSeedWords({
          isRemoteKey: true,
          signingPayload: {},
          defaultVault: { signers: [signer], networkType: config.NETWORK_TYPE }, // replicating vault details in case of RK
          seedBasedSingerMnemonic,
          serializedPSBT: serializedPSBTEnvelop.serializedPSBT,
          xfp: {},
          isMultisig: isMultisig,
        });
        if (signedSerializedPSBT) {
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_SIGNING,
              },
            ])
          );
          navigateToShowPSBT(signedSerializedPSBT);
        }
      } else if (SignerType.MY_KEEPER === signerType) {
        let signedSerializedPSBT: string;
        const key = signer.signerXpubs[XpubTypes.P2WSH][0];
        if (!key.xpriv) {
          let { xpubDetails } = await getCosignerDetails(
            primaryMnemonic,
            signer.extraData.instanceNumber - 1
          );
          if (key.xpub != xpubDetails[XpubTypes.P2WSH].xpub) {
            throw new Error('Cannot get private key of signer');
          }
          key.xpriv = xpubDetails[XpubTypes.P2WSH].xpriv;
        }
        signedSerializedPSBT = signCosignerPSBT(
          signer.masterFingerprint,
          key.xpriv,
          serializedPSBTEnvelop.serializedPSBT
        );
        if (signedSerializedPSBT) {
          navigateToShowPSBT(signedSerializedPSBT);
        }
      } else if (SignerType.TAPSIGNER === signerType) {
        const currentKey = {
          derivationPath: signer.signerXpubs[XpubTypes.P2WSH][0].derivationPath,
        };
        const inputs = getInputsFromPSBT(serializedPSBTEnvelop.serializedPSBT);
        const inputsToSign = getInputsToSignFromPSBT(serializedPSBTEnvelop.serializedPSBT, signer);
        const signingPayload = [
          {
            payloadTarget: signer.type,
            inputsToSign,
            inputs,
          },
        ];

        const { signingPayload: signedPayload } = await signTransactionWithTapsigner({
          setTapsignerModal,
          signingPayload,
          currentKey,
          withModal,
          defaultVault: {},
          serializedPSBT: serializedPSBTEnvelop.serializedPSBT,
          card,
          cvc: tapsignerCVC,
          signer,
        });
        const psbt = bitcoin.Psbt.fromBase64(serializedPSBTEnvelop.serializedPSBT);
        signedPayload[0].inputsToSign.forEach(
          ({ inputIndex, signature, publicKey, sighashType }) => {
            psbt.addSignedDigest(
              inputIndex,
              Buffer.from(publicKey, 'hex'),
              Buffer.from(signature, 'hex'),
              sighashType
            );
          }
        );
        const signedPSBT = psbt.toBase64();
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_SIGNING,
            },
          ])
        );
        return signedPSBT;
      } else if (SignerType.PORTAL === signerType) {
        const { signedSerializedPSBT } = await signTransactionWithPortal({
          setPortalModal,
          withNfcModal,
          serializedPSBTEnvelop,
          closeNfc,
          vault: {},
          portalCVC,
        });
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_SIGNING,
            },
          ])
        );
        return signedSerializedPSBT;
      } else if (SignerType.COLDCARD === signerType) {
        await signTransactionWithColdCard({
          setColdCardModal,
          withNfcModal,
          serializedPSBTEnvelop,
          closeNfc,
        });
      }
    } catch (error) {
      console.log('🚀 ~ signTransaction ~ error:', error);
      showToast(`${error}`);
    }
  };

  const onFileSign = (signedSerializedPSBT: string) => {
    if (signerType == SignerType.KEYSTONE) {
      const tx = getTxHexFromKeystonePSBT(
        serializedPSBTEnvelop.serializedPSBT,
        signedSerializedPSBT
      );
      signedSerializedPSBT = tx.toHex();
    }
    dispatch(
      healthCheckStatusUpdate([
        {
          signerId: signer.masterFingerprint,
          status: hcStatusType.HEALTH_CHECK_SIGNING,
        },
      ])
    );
    navigateToShowPSBT(signedSerializedPSBT);
  };

  const vaultKeys = {
    masterFingerprint: signer.masterFingerprint,
    xpub: signer.signerXpubs[ScriptTypes.P2WSH][0].xpub,
    xfp: signer.masterFingerprint,
    derivationPath: signer.signerXpubs[ScriptTypes.P2WSH][0].derivationPath,
    registeredVaults: [],
  };
  return (
    <>
      <NfcPrompt visible={nfcVisible || TSNfcVisible} close={closeNfc} />
      {/* For MK  */}
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        title="Enter Passcode"
        subTitle={'Confirm passcode to sign with mobile key'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics={false}
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={signTransaction}
          />
        )}
      />
      <SignerModals
        vaultId={vaultId || ''}
        vaultKeys={[vaultKeys]}
        activeXfp={vaultKeys.masterFingerprint}
        coldCardModal={coldCardModal}
        tapsignerModal={tapsignerModal}
        ledgerModal={ledgerModal}
        otpModal={false}
        passwordModal={false}
        passportModal={passportModal}
        seedSignerModal={seedSignerModal}
        keystoneModal={keystoneModal}
        jadeModal={jadeModal}
        keeperModal={false}
        trezorModal={trezorModal}
        bitbox02Modal={bitbox02modal}
        otherSDModal={false}
        specterModal={specterModal}
        portalModal={portalModal}
        setSpecterModal={setSpecterModal}
        setOtherSDModal={() => {}}
        setTrezorModal={setTrezorModal}
        setBitbox02Modal={setBitbox02modal}
        setJadeModal={setJadeModal}
        setKeystoneModal={setKeystoneModal}
        setSeedSignerModal={setSeedSignerModal}
        setPassportModal={setPassportModal}
        setKeeperModal={() => {}}
        setColdCardModal={setColdCardModal}
        setLedgerModal={setLedgerModal}
        setPasswordModal={() => {}}
        setTapsignerModal={setTapsignerModal}
        showOTPModal={() => {}}
        setPortalModal={setPortalModal}
        signTransaction={signTransaction}
        textRef={textRef}
        isMultisig={isMultisig}
        signerMap={signerMap}
        onFileSign={onFileSign}
        isRemoteKey={true}
        isMiniscript={isMiniscript}
        serializedPSBTEnvelopFromProps={{
          serializedPSBT: psbt,
          isSigned: false,
          signerType,
          xfp: vaultKeys.xfp,
        }}
      />
    </>
  );
};

export default forwardRef(RKSignersModal);
