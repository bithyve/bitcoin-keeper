import { FlatList } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SignerType, TxPriority } from 'src/core/wallets/enums';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { sendPhaseThree } from 'src/store/sagaActions/send_and_receive';

import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import Note from 'src/components/Note/Note';
import { RealmSchema } from 'src/storage/realm/enum';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SigningServer from 'src/services/operations/SigningServer';
import { cloneDeep } from 'lodash';
import { finaliseVaultMigration } from 'src/store/sagaActions/vaults';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { hp, wp } from 'src/constants/responsive';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import idx from 'idx';
import { sendPhaseThreeReset, updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import useNfcModal from 'src/hooks/useNfcModal';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import useToastMessage from 'src/hooks/useToastMessage';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import { clearSigningDevice } from 'src/store/reducers/vaults';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import useVault from 'src/hooks/useVault';
import { signCosignerPSBT } from 'src/core/wallets/factories/WalletFactory';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import SignerModals from './SignerModals';
import SignerList from './SignerList';
import {
  signTransactionWithColdCard,
  signTransactionWithInheritanceKey,
  signTransactionWithMobileKey,
  signTransactionWithSeedWords,
  signTransactionWithSigningServer,
  signTransactionWithTapsigner,
} from './signWithSD';
import { useQuery } from '@realm/react';

function SignTransactionScreen() {
  const route = useRoute();
  const { note, label, collaborativeWalletId } = (route.params || {
    note: '',
    label: [],
    collaborativeWalletId: '',
  }) as {
    note: string;
    label: { name: string; isSystem: boolean }[];
    collaborativeWalletId: string;
  };
  const { activeVault: defaultVault } = useVault(collaborativeWalletId);
  const { signers, id: vaultId, scheme, shellId } = defaultVault;
  const { wallets } = useWallets({ walletIds: [collaborativeWalletId] });
  let parentCollaborativeWallet: Wallet;
  if (collaborativeWalletId) {
    parentCollaborativeWallet = wallets.find((wallet) => wallet.id === collaborativeWalletId);
  }
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  const [coldCardModal, setColdCardModal] = useState(false);
  const [tapsignerModal, setTapsignerModal] = useState(false);
  const [ledgerModal, setLedgerModal] = useState(false);
  const [passportModal, setPassportModal] = useState(false);
  const [seedSignerModal, setSeedSignerModal] = useState(false);
  const [keystoneModal, setKeystoneModal] = useState(false);
  const [jadeModal, setJadeModal] = useState(false);
  const [keeperModal, setKeeperModal] = useState(false);
  const [trezorModal, setTrezorModal] = useState(false);
  const [bitbox02Modal, setBitbox02Modal] = useState(false);
  const [otherSDModal, setOtherSDModal] = useState(false);
  const [otpModal, showOTPModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  const [activeSignerId, setActiveSignerId] = useState<string>();
  const { showToast } = useToastMessage();

  const navigation = useNavigation();
  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const { relayVaultUpdate, relayVaultError, realyVaultErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const isMigratingNewVault = useAppSelector((state) => state.vault.isMigratingNewVault);
  const sendSuccessful = useAppSelector((state) => state.sendAndReceive.sendPhaseThree.txid);
  const sendFailedMessage = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseThree.failedErrorMessage
  );
  const [broadcasting, setBroadcasting] = useState(false);
  const textRef = useRef(null);
  const dispatch = useDispatch();

  const card = useRef(new CKTapCard()).current;

  useEffect(() => {
    if (relayVaultUpdate) {
      const navigationState = {
        index: 1,
        routes: [
          { name: 'Home' },
          {
            name: 'VaultDetails',
            params: { vaultTransferSuccessful: true, autoRefresh: true, collaborativeWalletId },
          },
        ],
      };
      navigation.dispatch(CommonActions.reset(navigationState));
      dispatch(resetRealyVaultState());
      dispatch(clearSigningDevice());
    }
    if (relayVaultError) {
      showToast(`Vault Creation Failed ${realyVaultErrorMessage}`, <ToastErrorIcon />);
      dispatch(resetRealyVaultState());
    }
  }, [relayVaultUpdate, relayVaultError]);

  useEffect(() => {
    if (isMigratingNewVault) {
      if (sendSuccessful) {
        dispatch(finaliseVaultMigration(vaultId));
      }
    } else if (sendSuccessful) {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'Home' },
            { name: 'VaultDetails', params: { autoRefresh: true, collaborativeWalletId } },
          ],
        })
      );
    }
  }, [sendSuccessful, isMigratingNewVault]);

  useEffect(() => {
    defaultVault.signers.forEach((signer) => {
      const isCoSignerMyself = signer.masterFingerprint === collaborativeWalletId;
      if (isCoSignerMyself) {
        // self sign PSBT
        signTransaction({ signerId: signer.signerId });
      }
    });
    return () => dispatch(sendPhaseThreeReset());
  }, []);

  useEffect(() => {
    if (sendFailedMessage && broadcasting) {
      setBroadcasting(false);
      showToast(sendFailedMessage);
    }
  }, [sendFailedMessage, broadcasting]);

  const areSignaturesSufficient = () => {
    let signedTxCount = 0;
    serializedPSBTEnvelops.forEach((envelop) => {
      if (envelop.isSigned) {
        signedTxCount += 1;
      }
    });
    // modify this in dev builds for mock signers
    if (signedTxCount >= defaultVault.scheme.m) {
      return true;
    }
    return false;
  };

  const { withModal, nfcVisible: TSNfcVisible } = useTapsignerModal(card);
  const { withNfcModal, nfcVisible, closeNfc } = useNfcModal();

  const signTransaction = useCallback(
    async ({
      signerId,
      signingServerOTP,
      seedBasedSingerMnemonic,
      thresholdDescriptors,
    }: {
      signerId?: string;
      signingServerOTP?: string;
      seedBasedSingerMnemonic?: string;
      thresholdDescriptors?: string[];
    } = {}) => {
      const activeId = signerId || activeSignerId;
      const currentSigner = signers.filter((signer) => signer.signerId === activeId)[0];
      if (serializedPSBTEnvelops && serializedPSBTEnvelops.length) {
        const serializedPSBTEnvelop = serializedPSBTEnvelops.filter(
          (envelop) => envelop.signerId === activeId
        )[0];
        const copySerializedPSBTEnvelop = cloneDeep(serializedPSBTEnvelop);
        const { signerType, serializedPSBT, signingPayload, signerId } = copySerializedPSBTEnvelop;
        if (SignerType.TAPSIGNER === signerType) {
          const { signingPayload: signedPayload, signedSerializedPSBT } =
            await signTransactionWithTapsigner({
              setTapsignerModal,
              signingPayload,
              currentSigner,
              withModal,
              defaultVault,
              serializedPSBT,
              card,
              cvc: textRef.current,
            });
          dispatch(
            updatePSBTEnvelops({ signedSerializedPSBT, signerId, signingPayload: signedPayload })
          );
          dispatch(healthCheckSigner([currentSigner]));
        } else if (SignerType.COLDCARD === signerType) {
          await signTransactionWithColdCard({
            setColdCardModal,
            withNfcModal,
            serializedPSBTEnvelop,
            closeNfc,
          });
        } else if (SignerType.MOBILE_KEY === signerType) {
          const { signedSerializedPSBT } = await signTransactionWithMobileKey({
            setPasswordModal,
            signingPayload,
            defaultVault,
            serializedPSBT,
            signerId,
          });
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, signerId }));
          dispatch(healthCheckSigner([currentSigner]));
        } else if (SignerType.POLICY_SERVER === signerType) {
          const { signedSerializedPSBT } = await signTransactionWithSigningServer({
            showOTPModal,
            keeper,
            signingPayload,
            signingServerOTP,
            serializedPSBT,
            SigningServer,
            shellId,
          });
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, signerId }));
          dispatch(healthCheckSigner([currentSigner]));
        } else if (SignerType.INHERITANCEKEY === signerType) {
          const { signedSerializedPSBT } = await signTransactionWithInheritanceKey({
            signingPayload,
            serializedPSBT,
            shellId,
            thresholdDescriptors,
          });
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, signerId }));
        } else if (SignerType.SEED_WORDS === signerType) {
          const { signedSerializedPSBT } = await signTransactionWithSeedWords({
            signingPayload,
            defaultVault,
            seedBasedSingerMnemonic,
            serializedPSBT,
            signerId,
            isMultisig: defaultVault.isMultiSig,
          });
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, signerId }));
          dispatch(healthCheckSigner([currentSigner]));
        } else if (SignerType.KEEPER === signerType) {
          const signedSerializedPSBT = signCosignerPSBT(parentCollaborativeWallet, serializedPSBT);
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, signerId }));
          dispatch(healthCheckSigner([currentSigner]));
        }
      }
    },
    [activeSignerId, serializedPSBTEnvelops]
  );

  const callbackForSigners = ({
    type,
    signerId,
    signerPolicy,
    inheritanceKeyInfo,
    masterFingerprint,
  }: VaultSigner) => {
    setActiveSignerId(signerId);
    if (areSignaturesSufficient()) {
      showToast('We already have enough signatures, you can now broadcast.');
      return;
    }
    switch (type) {
      case SignerType.TAPSIGNER:
        setTapsignerModal(true);
        break;
      case SignerType.COLDCARD:
        setColdCardModal(true);
        break;
      case SignerType.LEDGER:
        setLedgerModal(true);
        break;
      case SignerType.MOBILE_KEY:
        setPasswordModal(true);
        break;
      case SignerType.POLICY_SERVER:
        if (signerPolicy) {
          const serializedPSBTEnvelop = serializedPSBTEnvelops.filter(
            (envelop) => envelop.signerId === signerId
          )[0];
          const outgoing = idx(serializedPSBTEnvelop, (_) => _.signingPayload[0].outgoing);
          if (
            !signerPolicy.exceptions.none &&
            outgoing <= signerPolicy.exceptions.transactionAmount
          ) {
            showToast('Auto-signing, send amount smaller than max no-check amount');
            signTransaction({ signerId }); // case: OTP not required
          } else showOTPModal(true);
        } else showOTPModal(true);
        break;
      case SignerType.SEED_WORDS:
        navigation.dispatch(
          CommonActions.navigate({
            name: 'InputSeedWordSigner',
            params: {
              signerId,
              onSuccess: signTransaction,
            },
          })
        );
        break;
      case SignerType.PASSPORT:
        setPassportModal(true);
        break;
      case SignerType.SEEDSIGNER:
        setSeedSignerModal(true);
        break;
      case SignerType.KEYSTONE:
        setKeystoneModal(true);
        break;
      case SignerType.JADE:
        setJadeModal(true);
        break;
      case SignerType.KEEPER:
        if (masterFingerprint === collaborativeWalletId) {
          signTransaction({ signerId });
          return;
        }
        setKeeperModal(true);
        break;
      case SignerType.TREZOR:
        if (defaultVault.isMultiSig) {
          showToast('Signing with trezor for multisig transactions is coming soon!', null, 4000);
          return;
        }
        setTrezorModal(true);
        break;
      case SignerType.BITBOX02:
        setBitbox02Modal(true);
        break;
      case SignerType.OTHER_SD:
        setOtherSDModal(true);
        break;
      case SignerType.INHERITANCEKEY:
        // if (inheritanceKeyInfo) {
        //   const thresholdDescriptors = inheritanceKeyInfo.configuration.descriptors.slice(0, 2);
        //   signTransaction({ signerId, thresholdDescriptors });
        // } else showToast('Inheritance config missing');
        showToast('Signing via Inheritance Key is not available', <ToastErrorIcon />);
        break;
      default:
        showToast(`action not set for ${type}`);
        break;
    }
  };

  return (
    <ScreenWrapper>
      <KeeperHeader
        title="Sign Transaction"
        subtitle={`Chose any ${scheme.m} to sign the transaction`}
      />
      <FlatList
        contentContainerStyle={{ paddingTop: '5%' }}
        data={signers}
        keyExtractor={(item) => item.signerId}
        renderItem={({ item }) => (
          <SignerList
            signer={item}
            callback={() => callbackForSigners(item)}
            envelops={serializedPSBTEnvelops}
          />
        )}
      />
      <Box alignItems="flex-end" marginY={5}>
        <Buttons
          primaryDisable={!areSignaturesSufficient()}
          primaryLoading={broadcasting}
          primaryText="Broadcast"
          primaryCallback={() => {
            if (areSignaturesSufficient()) {
              setBroadcasting(true);
              dispatch(
                sendPhaseThree({
                  wallet: defaultVault,
                  txnPriority: TxPriority.LOW,
                  note,
                  label,
                })
              );
            } else {
              showToast(`Sorry there aren't enough signatures!`);
            }
          }}
        />
      </Box>
      <Note
        title="Note"
        subtitle="Once the signed transaction (PSBT) is signed by a minimum quorum of signing devices, it can be broadcasted."
        subtitleColor="GreyText"
      />
      <SignerModals
        signers={signers}
        activeSignerId={activeSignerId}
        coldCardModal={coldCardModal}
        tapsignerModal={tapsignerModal}
        ledgerModal={ledgerModal}
        otpModal={otpModal}
        passwordModal={passwordModal}
        passportModal={passportModal}
        seedSignerModal={seedSignerModal}
        keystoneModal={keystoneModal}
        jadeModal={jadeModal}
        keeperModal={keeperModal}
        trezorModal={trezorModal}
        bitbox02Modal={bitbox02Modal}
        otherSDModal={otherSDModal}
        setOtherSDModal={setOtherSDModal}
        setTrezorModal={setTrezorModal}
        setBitbox02Modal={setBitbox02Modal}
        setJadeModal={setJadeModal}
        setKeystoneModal={setKeystoneModal}
        setSeedSignerModal={setSeedSignerModal}
        setPassportModal={setPassportModal}
        setKeeperModal={setKeeperModal}
        setColdCardModal={setColdCardModal}
        setLedgerModal={setLedgerModal}
        setPasswordModal={setPasswordModal}
        setTapsignerModal={setTapsignerModal}
        showOTPModal={showOTPModal}
        signTransaction={signTransaction}
        textRef={textRef}
        isMultisig={defaultVault.isMultiSig}
        collaborativeWalletId={collaborativeWalletId}
      />
      <NfcPrompt visible={nfcVisible || TSNfcVisible} close={closeNfc} />
    </ScreenWrapper>
  );
}

export default SignTransactionScreen;
