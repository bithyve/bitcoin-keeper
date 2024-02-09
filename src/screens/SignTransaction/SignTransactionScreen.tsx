import { FlatList } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SignerType, TxPriority } from 'src/core/wallets/enums';
import { Signer, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { sendPhaseThree } from 'src/store/sagaActions/send_and_receive';
import { Box, useColorMode } from 'native-base';
import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import Note from 'src/components/Note/Note';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { cloneDeep } from 'lodash';
import { finaliseVaultMigration } from 'src/store/sagaActions/vaults';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import SuccessIcon from 'src/assets/images/successSvg.svg';
import idx from 'idx';
import { sendPhaseThreeReset, updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import useNfcModal from 'src/hooks/useNfcModal';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import useToastMessage from 'src/hooks/useToastMessage';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import useVault from 'src/hooks/useVault';
import { signCosignerPSBT } from 'src/core/wallets/factories/WalletFactory';
import useWallets from 'src/hooks/useWallets';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import {
  signTransactionWithColdCard,
  signTransactionWithInheritanceKey,
  signTransactionWithMobileKey,
  signTransactionWithSeedWords,
  signTransactionWithSigningServer,
  signTransactionWithTapsigner,
} from './signWithSD';
import useSignerMap from 'src/hooks/useSignerMap';
import SignerList from './SignerList';
import SignerModals from './SignerModals';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';

function SignTransactionScreen() {
  const route = useRoute();
  const { colorMode } = useColorMode();

  const { note, label, collaborativeWalletId, vaultId } = (route.params || {
    note: '',
    label: [],
    collaborativeWalletId: '',
    vaultId: '',
  }) as {
    note: string;
    label: { name: string; isSystem: boolean }[];
    collaborativeWalletId: string;
    vaultId: string;
  };

  const { activeVault: defaultVault } = useVault({
    collaborativeWalletId,
    vaultId,
  });

  const { signers: vaultKeys, scheme } = defaultVault;

  const { signerMap } = useSignerMap();
  const { wallets } = useWallets({ walletIds: [collaborativeWalletId] });
  let parentCollaborativeWallet: Wallet;
  if (collaborativeWalletId) {
    parentCollaborativeWallet = wallets.find(
      (wallet) => wallet && wallet.id === collaborativeWalletId
    );
  }

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTransactions, common } = translations;

  const [coldCardModal, setColdCardModal] = useState(false);
  const [tapsignerModal, setTapsignerModal] = useState(false);
  const [ledgerModal, setLedgerModal] = useState(false);
  const [passportModal, setPassportModal] = useState(false);
  const [seedSignerModal, setSeedSignerModal] = useState(false);
  const [specterModal, setSpecterModal] = useState(false);
  const [keystoneModal, setKeystoneModal] = useState(false);
  const [jadeModal, setJadeModal] = useState(false);
  const [keeperModal, setKeeperModal] = useState(false);
  const [trezorModal, setTrezorModal] = useState(false);
  const [bitbox02Modal, setBitbox02Modal] = useState(false);
  const [otherSDModal, setOtherSDModal] = useState(false);
  const [otpModal, showOTPModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  const [activeXfp, setActiveXfp] = useState<string>();
  const { showToast } = useToastMessage();

  const navigation = useNavigation();
  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const { relayVaultUpdate, relayVaultError, realyVaultErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const isMigratingNewVault = useAppSelector((state) => state.vault.isMigratingNewVault);
  const intrimVault = useAppSelector((state) => state.vault.intrimVault);
  const sendSuccessful = useAppSelector((state) => state.sendAndReceive.sendPhaseThree.txid);
  const sendFailedMessage = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseThree.failedErrorMessage
  );
  const [broadcasting, setBroadcasting] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
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
            params: {
              vaultTransferSuccessful: true,
              autoRefresh: true,
              vaultId: intrimVault?.id || '',
            },
          },
        ],
      };
      navigation.dispatch(CommonActions.reset(navigationState));
      dispatch(resetRealyVaultState());
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
      setVisibleModal(true);
    }
  }, [sendSuccessful, isMigratingNewVault]);

  useEffect(() => {
    defaultVault.signers.forEach((vaultKey) => {
      const isCoSignerMyself = vaultKey.masterFingerprint === collaborativeWalletId;
      if (isCoSignerMyself) {
        // self sign PSBT
        signTransaction({ xfp: vaultKey.xfp });
      }
    });
    return () => {
      dispatch(sendPhaseThreeReset());
    };
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
      xfp,
      signingServerOTP,
      seedBasedSingerMnemonic,
      thresholdDescriptors,
    }: {
      xfp?: string;
      signingServerOTP?: string;
      seedBasedSingerMnemonic?: string;
      thresholdDescriptors?: string[];
    } = {}) => {
      const activeId = xfp || activeXfp;
      const currentKey = vaultKeys.filter((vaultKey) => vaultKey.xfp === activeId)[0];
      const signer = signerMap[currentKey.masterFingerprint];
      if (serializedPSBTEnvelops && serializedPSBTEnvelops.length) {
        const serializedPSBTEnvelop = serializedPSBTEnvelops.filter(
          (envelop) => envelop.xfp === activeId
        )[0];
        const copySerializedPSBTEnvelop = cloneDeep(serializedPSBTEnvelop);
        const { signerType, serializedPSBT, signingPayload, xfp } = copySerializedPSBTEnvelop;
        if (SignerType.TAPSIGNER === signerType) {
          const { signingPayload: signedPayload, signedSerializedPSBT } =
            await signTransactionWithTapsigner({
              setTapsignerModal,
              signingPayload,
              currentKey,
              withModal,
              defaultVault,
              serializedPSBT,
              card,
              cvc: textRef.current,
              signer,
            });
          dispatch(
            updatePSBTEnvelops({ signedSerializedPSBT, xfp, signingPayload: signedPayload })
          );
          dispatch(healthCheckSigner([signer]));
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
            xfp,
          });
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp }));
          dispatch(healthCheckSigner([signer]));
        } else if (SignerType.POLICY_SERVER === signerType) {
          const { signedSerializedPSBT } = await signTransactionWithSigningServer({
            xfp,
            signingPayload,
            signingServerOTP,
            serializedPSBT,
            showOTPModal,
            showToast,
          });
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp }));
          dispatch(healthCheckSigner([signer]));
        } else if (SignerType.INHERITANCEKEY === signerType) {
          const { signedSerializedPSBT } = await signTransactionWithInheritanceKey({
            signingPayload,
            serializedPSBT,
            xfp,
            thresholdDescriptors,
          });
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp }));
        } else if (SignerType.SEED_WORDS === signerType) {
          const { signedSerializedPSBT } = await signTransactionWithSeedWords({
            signingPayload,
            defaultVault,
            seedBasedSingerMnemonic,
            serializedPSBT,
            xfp,
            isMultisig: defaultVault.isMultiSig,
          });
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp }));
          dispatch(healthCheckSigner([signer]));
        } else if (SignerType.KEEPER === signerType) {
          const signedSerializedPSBT = signCosignerPSBT(parentCollaborativeWallet, serializedPSBT);
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp }));
          dispatch(healthCheckSigner([signer]));
        }
      }
    },
    [activeXfp, serializedPSBTEnvelops]
  );

  const callbackForSigners = (vaultKey: VaultSigner, signer: Signer) => {
    setActiveXfp(vaultKey.xfp);
    if (areSignaturesSufficient()) {
      showToast('We already have enough signatures, you can now broadcast.');
      return;
    }
    switch (signer.type) {
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
        if (signer.signerPolicy) {
          const serializedPSBTEnvelop = serializedPSBTEnvelops.filter(
            (envelop) => envelop.xfp === vaultKey.xfp
          )[0];
          const outgoing = idx(serializedPSBTEnvelop, (_) => _.signingPayload[0].outgoing);
          if (
            !signer.signerPolicy.exceptions.none &&
            outgoing <= signer.signerPolicy.exceptions.transactionAmount
          ) {
            showToast('Auto-signing, send amount smaller than max no-check amount');
            signTransaction({ xfp: vaultKey.xfp }); // case: OTP not required
          } else showOTPModal(true);
        } else showOTPModal(true);
        break;
      case SignerType.SEED_WORDS:
        navigation.dispatch(
          CommonActions.navigate({
            name: 'InputSeedWordSigner',
            params: {
              xfp: vaultKey.xfp,
              onSuccess: signTransaction,
            },
          })
        );
        break;
      case SignerType.PASSPORT:
        setPassportModal(true);
        break;
      case SignerType.SPECTER:
        setSpecterModal(true);
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
        if (vaultKey.masterFingerprint === collaborativeWalletId) {
          signTransaction({ xfp: vaultKey.xfp });
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
        showToast(`action not set for ${signer.type}`);
        break;
    }
  };
  function SendSuccessfulContent() {
    const { colorMode } = useColorMode();
    return (
      <Box>
        <Box alignSelf="center">
          <SuccessIcon />
        </Box>
        <Text color={`${colorMode}.greenText`} fontSize={13} padding={2}>
          {walletTransactions.sendTransSuccessMsg}
        </Text>
      </Box>
    );
  }
  const viewDetails = () => {
    setVisibleModal(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'Home' },
          { name: 'VaultDetails', params: { autoRefresh: true, collaborativeWalletId, vaultId } },
        ],
      })
    );
  };
  return (
    <ScreenWrapper>
      <ActivityIndicatorView visible={broadcasting} showLoader />
      <KeeperHeader
        title="Sign Transaction"
        subtitle={`Choose at least ${scheme.m} to sign the transaction`}
      />
      <FlatList
        contentContainerStyle={{ paddingTop: '5%' }}
        data={vaultKeys}
        keyExtractor={(item) => item.xfp}
        renderItem={({ item }) => (
          <SignerList
            vaultKey={item}
            callback={() => callbackForSigners(item, signerMap[item.masterFingerprint])}
            envelops={serializedPSBTEnvelops}
            signerMap={signerMap}
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
              showToast("Sorry there aren't enough signatures!");
            }
          }}
        />
      </Box>
      <Note
        title={common.note}
        subtitle="Once the signed transaction (PSBT) is signed by a minimum quorum of signers, it can be broadcasted."
        subtitleColor="GreyText"
      />
      <SignerModals
        vaultId={vaultId}
        vaultKeys={vaultKeys}
        activeXfp={activeXfp}
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
        specterModal={specterModal}
        setSpecterModal={setSpecterModal}
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
        signerMap={signerMap}
      />
      <NfcPrompt visible={nfcVisible || TSNfcVisible} close={closeNfc} />
      <KeeperModal
        visible={visibleModal}
        close={() => setVisibleModal(false)}
        title={walletTransactions.SendSuccess}
        subTitle={walletTransactions.transactionBroadcasted}
        buttonText={walletTransactions.ViewDetails}
        buttonCallback={viewDetails}
        textColor={`${colorMode}.greenText`}
        buttonTextColor={`${colorMode}.white`}
        Content={SendSuccessfulContent}
      />
    </ScreenWrapper>
  );
}

export default SignTransactionScreen;
