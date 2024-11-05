import { FlatList } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NetworkType, SignerType, TxPriority } from 'src/services/wallets/enums';
import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { sendPhaseThree } from 'src/store/sagaActions/send_and_receive';
import { Box, useColorMode } from 'native-base';
import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import Note from 'src/components/Note/Note';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { cloneDeep } from 'lodash';
import { finaliseVaultMigration, refillMobileKey } from 'src/store/sagaActions/vaults';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import SuccessLightIllustration from 'src/assets/images/upgrade-illustration.svg';
import SuccessDarkIllustration from 'src/assets/images/upgrade-dark-illustration.svg';
import ShareGreen from 'src/assets/images/share-arrow-green.svg';
import ShareWhite from 'src/assets/images/share-arrow-white.svg';
import idx from 'idx';
import { sendPhaseThreeReset, updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import useNfcModal from 'src/hooks/useNfcModal';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import useToastMessage from 'src/hooks/useToastMessage';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import useVault from 'src/hooks/useVault';
import { signCosignerPSBT } from 'src/services/wallets/factories/WalletFactory';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useSignerMap from 'src/hooks/useSignerMap';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import {
  signTransactionWithColdCard,
  signTransactionWithInheritanceKey,
  signTransactionWithMobileKey,
  signTransactionWithSeedWords,
  signTransactionWithSigningServer,
  signTransactionWithTapsigner,
} from './signWithSD';
import SignerList from './SignerList';
import SignerModals from './SignerModals';
import * as Sentry from '@sentry/react-native';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import { getTxHexFromKeystonePSBT } from 'src/hardware/keystone';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { resetKeyHealthState } from 'src/store/reducers/vaults';
import { InheritanceConfiguration } from 'src/models/interfaces/AssistedKeys';
import { generateKey } from 'src/utils/service-utilities/encryption';
import { formatDuration } from '../Vault/HardwareModalMap';
import { setInheritanceSigningRequestId } from 'src/store/reducers/send_and_receive';
import TickIcon from 'src/assets/images/tick_icon.svg';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import {
  cachedTxSnapshot,
  dropTransactionSnapshot,
  setTransactionSnapshot,
} from 'src/store/reducers/cachedTxn';
import { SendConfirmationRouteParams, tnxDetailsProps } from '../Send/SendConfirmation';
import { SIGNTRANSACTION } from 'src/navigation/contants';
import openLink from 'src/utils/OpenLink';
import config from 'src/utils/service-utilities/config';

function SignTransactionScreen() {
  const route = useRoute();
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  const { note, label, vaultId, sendConfirmationRouteParams, isMoveAllFunds, tnxDetails } =
    (route.params || {
      note: '',
      label: [],
      vaultId: '',
      sendConfirmationRouteParams: null,
      isMoveAllFunds: false,
      sender: {},
    }) as {
      note: string;
      label: { name: string; isSystem: boolean }[];
      vaultId: string;
      isMoveAllFunds: boolean;
      sender: Vault;
      sendConfirmationRouteParams: SendConfirmationRouteParams;
      tnxDetails: tnxDetailsProps;
    };

  const { activeVault: defaultVault } = useVault({
    vaultId,
  });

  const { signers: vaultKeys, scheme } = defaultVault;

  const { signerMap } = useSignerMap();
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
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [isIKSClicked, setIsIKSClicked] = useState(false);
  const [isIKSDeclined, setIsIKSDeclined] = useState(false);
  const [isIKSApproved, setIsIKSApproved] = useState(false);
  const [IKSSignTime, setIKSSignTime] = useState(0);
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
  const card = useRef(new CKTapCard()).current;
  const dispatch = useDispatch();

  const cachedTxn = useAppSelector((state) => state.cachedTxn);
  const cachedTxid = useAppSelector((state) => state.sendAndReceive.sendPhaseTwo.cachedTxid);
  const snapshot: cachedTxSnapshot = cachedTxn.snapshots[cachedTxid];

  const [snapshotOptions, setSnapshotOptions] = useState(snapshot?.options || {});
  const sendAndReceive = useAppSelector((state) => state.sendAndReceive);
  const [approveOnce, setApproveOnce] = useState(true);

  useEffect(() => {
    if (snapshotOptions && snapshotOptions.requestStatusIKS) {
      const { approvesIn, isDeclined, isApproved, syncedAt } = snapshotOptions.requestStatusIKS;
      if (isApproved) {
        setIsIKSApproved(true);
      } else if (isDeclined) {
        setIsIKSDeclined(true);
      } else {
        setIsIKSClicked(true);
        if (approvesIn && syncedAt) {
          const interval = setInterval(() => {
            const timeLeft = approvesIn - (Date.now() - syncedAt);
            setIKSSignTime(timeLeft);
            if (timeLeft < 0) {
              let iksKey;
              for (let i = 0; i < vaultKeys.length; i++) {
                const key = vaultKeys[i];
                if (signerMap[key.masterFingerprint].type === SignerType.INHERITANCEKEY) {
                  iksKey = key;
                  break;
                }
              }
              if (iksKey && approveOnce) {
                callbackForSigners(iksKey, signerMap[iksKey.masterFingerprint]);
                setApproveOnce(false);
              }
              clearInterval(interval);
            }
          }, 1000);

          return () => clearInterval(interval);
        }
      }
    }
  }, [snapshotOptions]);

  useEffect(() => {
    if (sendAndReceive.sendPhaseThree.txid) {
      // transaction successful
      dispatch(dropTransactionSnapshot({ cachedTxid }));
    } else {
      // transaction in process, sets/updates transaction snapshot
      dispatch(
        setTransactionSnapshot({
          cachedTxid,
          snapshot: {
            state: sendAndReceive,
            routeParams: sendConfirmationRouteParams,
            options: snapshotOptions,
          },
        })
      );
    }
  }, [sendAndReceive, snapshotOptions]);

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
              transactionToast: true,
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
      showToast(`Error: ${realyVaultErrorMessage}`, <ToastErrorIcon />);
      dispatch(resetRealyVaultState());
    }
  }, [relayVaultUpdate, relayVaultError]);

  useEffect(() => {
    if (isMigratingNewVault) {
      if (sendSuccessful) {
        dispatch(finaliseVaultMigration(vaultId));
      }
    } else if (sendSuccessful) {
      setBroadcasting(false);
      setVisibleModal(true);
    }
  }, [sendSuccessful, isMigratingNewVault]);

  useEffect(() => {
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

  const onSuccess = () => {
    signTransaction({ xfp: activeXfp });
  };

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

  useEffect(() => {
    vaultKeys.forEach((vaultKey) => {
      const signer = signerMap[vaultKey.masterFingerprint];
      if (signer.type === SignerType.MY_KEEPER && !vaultKey.xpriv) {
        dispatch(refillMobileKey(vaultKey));
      }
    });
    return () => {
      dispatch(resetKeyHealthState());
    };
  }, []);

  const { withModal, nfcVisible: TSNfcVisible } = useTapsignerModal(card);
  const { withNfcModal, nfcVisible, closeNfc } = useNfcModal();
  const { inheritanceSigningRequestId } = useAppSelector((state) => state.sendAndReceive);

  const signTransaction = useCallback(
    async ({
      xfp,
      signingServerOTP,
      seedBasedSingerMnemonic,
      inheritanceConfiguration,
      tapsignerCVC,
    }: {
      xfp?: string;
      signingServerOTP?: string;
      seedBasedSingerMnemonic?: string;
      inheritanceConfiguration?: InheritanceConfiguration;
      tapsignerCVC?: string;
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
              cvc: tapsignerCVC,
              signer,
            });
          dispatch(
            updatePSBTEnvelops({ signedSerializedPSBT, xfp, signingPayload: signedPayload })
          );
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_SIGNING,
              },
            ])
          );
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
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_SIGNING,
              },
            ])
          );
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
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_SIGNING,
              },
            ])
          );
        } else if (SignerType.INHERITANCEKEY === signerType) {
          let requestId = inheritanceSigningRequestId;
          let isNewRequest = false;

          if (!requestId) {
            requestId = `request-${generateKey(14)}`;
            isNewRequest = true;
          }

          const { requestStatus, signedSerializedPSBT } = await signTransactionWithInheritanceKey({
            signingPayload,
            serializedPSBT,
            xfp,
            requestId,
            inheritanceConfiguration,
            showToast,
          });

          if (requestStatus) {
            setIsIKSClicked(true);
            setSnapshotOptions({ requestStatusIKS: { ...requestStatus, syncedAt: Date.now() } });
            if (isNewRequest) dispatch(setInheritanceSigningRequestId(requestId));
          }

          // process request based on status
          if (requestStatus.isDeclined) {
            setIsIKSDeclined(true);
            showToast('Inheritance Key Signing request has been declined', <ToastErrorIcon />);
            // dispatch(setInheritanceSigningRequestId('')); // clear existing request
          } else if (!requestStatus.isApproved) {
            showToast(
              `Request would approve in ${formatDuration(
                requestStatus.approvesIn
              )} if not rejected`,
              <TickIcon />
            );
          } else if (requestStatus.isApproved && signedSerializedPSBT) {
            dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp }));
          } else showToast('Unknown request status, please try again');
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
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_SIGNING,
              },
            ])
          );
        } else if (SignerType.MY_KEEPER === signerType) {
          const signedSerializedPSBT = signCosignerPSBT(currentKey.xpriv, serializedPSBT);
          dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp }));
          dispatch(
            healthCheckStatusUpdate([
              {
                signerId: signer.masterFingerprint,
                status: hcStatusType.HEALTH_CHECK_SIGNING,
              },
            ])
          );
        }
      }
    },
    [activeXfp, serializedPSBTEnvelops, inheritanceSigningRequestId]
  );

  const onFileSign = (signedSerializedPSBT: string) => {
    const currentKey = vaultKeys.filter((vaultKey) => vaultKey.xfp === activeXfp)[0];
    const signer = signerMap[currentKey.masterFingerprint];
    if (signer.type === SignerType.KEYSTONE) {
      const serializedPSBTEnvelop = serializedPSBTEnvelops.filter(
        (envelop) => envelop.xfp === activeXfp
      )[0];
      const tx = getTxHexFromKeystonePSBT(
        serializedPSBTEnvelop.serializedPSBT,
        signedSerializedPSBT
      );
      dispatch(updatePSBTEnvelops({ xfp: activeXfp, txHex: tx.toHex() }));
      dispatch(
        healthCheckStatusUpdate([
          {
            signerId: signer.masterFingerprint,
            status: hcStatusType.HEALTH_CHECK_SIGNING,
          },
        ])
      );
      return;
    }
    dispatch(updatePSBTEnvelops({ signedSerializedPSBT, xfp: activeXfp }));
    dispatch(
      healthCheckStatusUpdate([
        {
          signerId: signer.masterFingerprint,
          status: hcStatusType.HEALTH_CHECK_SIGNING,
        },
      ])
    );
  };

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
      case SignerType.INHERITANCEKEY:
        if (signer.inheritanceKeyInfo) {
          let configurationForVault: InheritanceConfiguration;
          for (const config of signer.inheritanceKeyInfo.configurations) {
            if (config.id === defaultVault.id) {
              configurationForVault = config;
              break;
            }
          }
          if (!configurationForVault) {
            showToast(`Missing vault configuration for ${defaultVault.id}`);
            return;
          }
          signTransaction({
            xfp: vaultKey.xfp,
            inheritanceConfiguration: configurationForVault,
          });
        } else showToast('Inheritance key info missing');
        break;
      case SignerType.SEED_WORDS:
        navigation.dispatch(
          CommonActions.navigate({
            name: 'EnterSeedScreen',
            params: {
              parentScreen: SIGNTRANSACTION,
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
        setKeeperModal(true);
        break;
      case SignerType.TREZOR:
        setTrezorModal(true);
        break;
      case SignerType.BITBOX02:
        setBitbox02Modal(true);
        break;
      case SignerType.OTHER_SD:
        setOtherSDModal(true);
        break;
      case SignerType.MY_KEEPER:
        setConfirmPassVisible(true);
        break;
      default:
        showToast(`action not set for ${signer.type}`);
        break;
    }
  };

  function SendSuccessfulContent({
    primaryText,
    primaryCallback,
    secondaryText,
    secondaryCallback,
    SecondaryIcon,
  }) {
    const { colorMode } = useColorMode();
    return (
      <Box>
        <Box alignSelf="center">
          {isDarkMode ? <SuccessDarkIllustration /> : <SuccessLightIllustration />}
        </Box>
        <Text color={`${colorMode}.primaryText`} fontSize={13} padding={2}>
          {walletTransactions.sendTransSuccessMsg}
        </Text>
        <Box paddingTop={6}>
          <Buttons
            primaryText={primaryText}
            primaryCallback={primaryCallback}
            primaryTextColor={`${colorMode}.buttonText`}
            secondaryText={secondaryText}
            secondaryCallback={secondaryCallback}
            SecondaryIcon={SecondaryIcon}
          />
        </Box>
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
          { name: 'VaultDetails', params: { autoRefresh: true, vaultId, transactionToast: true } },
        ],
      })
    );
  };

  const viewManageWallets = () => {
    new Promise((resolve, reject) => {
      try {
        const result = dispatch(refreshWallets([sender], { hardRefresh: true }));
        resolve(result);
      } catch (error) {
        reject(error);
      }
    })
      .then(() => {
        setVisibleModal(false);
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: 'Home' },
              {
                name: 'ManageWallets',
              },
            ],
          })
        );
      })
      .catch((error) => {
        console.error('Error refreshing wallets:', error);
      });
  };

  const redirectToBlockExplorer = () => {
    openLink(
      `https://mempool.space${
        config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
      }/tx/${sendSuccessful}`
    );
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <ActivityIndicatorView visible={broadcasting} showLoader />
      <KeeperHeader
        title="Sign Transaction"
        subtitle={`Choose at least ${scheme.m} to sign the transaction`}
      />
      <FlatList
        contentContainerStyle={{ paddingTop: '5%' }}
        data={vaultKeys}
        keyExtractor={(item) => item.xfp}
        renderItem={({ item, index }) => (
          <SignerList
            isIKSClicked={isIKSClicked}
            isIKSDeclined={isIKSDeclined}
            IKSSignTime={IKSSignTime}
            vaultKey={item}
            callback={() => callbackForSigners(item, signerMap[item.masterFingerprint])}
            envelops={serializedPSBTEnvelops}
            signerMap={signerMap}
            isFirst={index === 0}
            isLast={index === vaultKeys.length - 1}
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
        isMultisig={defaultVault.isMultiSig}
        signerMap={signerMap}
        onFileSign={onFileSign}
        sendConfirmationRouteParams={sendConfirmationRouteParams}
        tnxDetails={tnxDetails}
        isRemoteKey={false}
      />
      <NfcPrompt visible={nfcVisible || TSNfcVisible} close={closeNfc} />
      <KeeperModal
        visible={visibleModal}
        close={() => {
          setVisibleModal(false);
          !isMoveAllFunds ? viewDetails() : viewManageWallets();
        }}
        title={walletTransactions.SendSuccess}
        subTitle={walletTransactions.transactionBroadcasted}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <SendSuccessfulContent
            primaryText={
              !isMoveAllFunds ? walletTransactions.ViewWallets : walletTransactions.ManageWallets
            }
            primaryCallback={!isMoveAllFunds ? viewDetails : viewManageWallets}
            secondaryCallback={redirectToBlockExplorer}
            secondaryText={common.shareDetails}
            SecondaryIcon={isDarkMode ? ShareWhite : ShareGreen}
          />
        )}
        DarkCloseIcon={colorMode === 'dark' ? 'light' : 'dark'}
      />
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        title="Enter Passcode"
        subTitle={'Confirm passcode to sign with mobile key'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics={false}
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={onSuccess}
          />
        )}
      />
    </ScreenWrapper>
  );
}

export default Sentry.withErrorBoundary(SignTransactionScreen, errorBourndaryOptions);
