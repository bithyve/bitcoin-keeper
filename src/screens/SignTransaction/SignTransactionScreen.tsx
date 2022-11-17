import { Alert, FlatList } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SignerType, TxPriority } from 'src/core/wallets/enums';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { sendPhaseThree, updatePSBTSignatures } from 'src/store/sagaActions/send_and_receive';
import {
  signTransactionWithColdCard,
  signTransactionWithLedger,
  signTransactionWithMobileKey,
  signTransactionWithSeedWords,
  signTransactionWithSigningServer,
  signTransactionWithTapsigner,
} from './signWithSD';

import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import HeaderTitle from 'src/components/HeaderTitle';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import Note from 'src/components/Note/Note';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SignerList from './SignerList';
import SignerModals from './SignerModals';
import SigningServer from 'src/core/services/operations/SigningServer';
import { cloneDeep } from 'lodash';
import { finaliseVaultMigration } from 'src/store/sagaActions/vaults';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { hp } from 'src/common/data/responsiveness/responsive';
import idx from 'idx';
import { readTapsigner } from 'src/hardware/tapsigner';
import { sendPhaseThreeReset } from 'src/store/reducers/send_and_receive';
import { signWithColdCard } from 'src/hardware/coldcard';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import useNfcModal from 'src/hooks/useNfcModal';
import useTapsignerModal from 'src/hooks/useTapsignerModal';

const SignTransactionScreen = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const defaultVault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const { signers, id: vaultId, scheme } = defaultVault;
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  const [coldCardModal, setColdCardModal] = useState(false);
  const [tapsignerModal, setTapsignerModal] = useState(false);
  const [ledgerModal, setLedgerModal] = useState(false);
  const [otpModal, showOTPModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  const [activeSignerId, setActiveSignerId] = useState<string>();
  const LedgerCom = useRef();

  const navigation = useNavigation();
  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const isMigratingNewVault = useAppSelector((state) => state.vault.isMigratingNewVault);
  const sendSuccessful = useAppSelector((state) => state.sendAndReceive.sendPhaseThree.txid);
  const [broadcasting, setBroadcasting] = useState(false);
  const textRef = useRef(null);
  const dispatch = useDispatch();

  const card = useRef(new CKTapCard()).current;

  useEffect(() => {
    const navigationState = {
      index: 1,
      routes: [
        { name: 'NewHome' },
        { name: 'VaultDetails', params: { vaultTransferSuccessful: true } },
      ],
    };
    if (isMigratingNewVault) {
      if (sendSuccessful) {
        dispatch(finaliseVaultMigration(vaultId));
        navigation.dispatch(CommonActions.reset(navigationState));
      } else {
        return;
      }
    } else {
      if (sendSuccessful) {
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: 'NewHome' }, { name: 'VaultDetails' }],
          })
        );
      }
    }
  }, [sendSuccessful, isMigratingNewVault]);

  useEffect(() => {
    return () => {
      dispatch(sendPhaseThreeReset());
    };
  }, []);

  const areSignaturesSufficient = () => {
    let signedTxCount = 0;
    serializedPSBTEnvelops.forEach((envelop) => {
      if (envelop.isSigned) {
        signedTxCount++;
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
    }: {
      signerId?: string;
      signingServerOTP?: string;
      seedBasedSingerMnemonic?: string;
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
              readTapsigner,
              defaultVault,
              serializedPSBT,
              card,
              cvc: textRef.current,
            });
          dispatch(
            updatePSBTSignatures({ signedSerializedPSBT, signerId, signingPayload: signedPayload })
          );
        } else if (SignerType.COLDCARD === signerType) {
          await signTransactionWithColdCard({
            setColdCardModal,
            withNfcModal,
            signWithColdCard,
            serializedPSBTEnvelop,
            signers,
            activeSignerId,
            defaultVault,
            closeNfc,
          });
        } else if (SignerType.LEDGER === signerType) {
          const { signedSerializedPSBT } = await signTransactionWithLedger({
            setLedgerModal,
            currentSigner,
            signingPayload,
            defaultVault,
            serializedPSBT,
          });
          dispatch(updatePSBTSignatures({ signedSerializedPSBT, signerId }));
        } else if (SignerType.MOBILE_KEY === signerType) {
          const { signedSerializedPSBT } = await signTransactionWithMobileKey({
            setPasswordModal,
            signingPayload,
            defaultVault,
            serializedPSBT,
            signerId,
          });
          dispatch(updatePSBTSignatures({ signedSerializedPSBT, signerId }));
        } else if (SignerType.POLICY_SERVER === signerType) {
          const { signedSerializedPSBT } = await signTransactionWithSigningServer({
            showOTPModal,
            keeper,
            signingPayload,
            signingServerOTP,
            serializedPSBT,
            SigningServer,
          });
          dispatch(updatePSBTSignatures({ signedSerializedPSBT, signerId }));
        } else if (SignerType.SEED_WORDS === signerType) {
          const { signedSerializedPSBT } = await signTransactionWithSeedWords({
            signingPayload,
            defaultVault,
            seedBasedSingerMnemonic,
            serializedPSBT,
            signerId,
          });
          dispatch(updatePSBTSignatures({ signedSerializedPSBT, signerId }));
        } else {
          return;
        }
      }
    },
    [activeSignerId, serializedPSBTEnvelops]
  );

  const callbackForSigners = ({ type, signerId, signerPolicy }: VaultSigner) => {
    setActiveSignerId(signerId);
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
            signTransaction({ signerId }); // case: OTP not required
          } else showOTPModal(true);
        } else showOTPModal(true);
        break;
      case SignerType.SEED_WORDS:
        navigation.dispatch(
          CommonActions.navigate({
            name: 'InputSeedWordSigner',
            params: {
              onSuccess: signTransaction,
            },
          })
        );
        break;
      default:
        Alert.alert(`action not set for ${type}`);
        break;
    }
  };

  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Sign Transaction"
        subtitle={`Chose any ${scheme.m} to sign the transaction`}
        paddingTop={hp(5)}
      />
      <FlatList
        contentContainerStyle={{ paddingTop: '10%' }}
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
      <Note
        title={'Note'}
        subtitle={
          'Once the signed transaction (PSBT) is signed by a minimum quorum of signing devices, it can be broadcasted.'
        }
        subtitleColor={'GreyText'}
      />
      <Box alignItems={'flex-end'} marginY={5}>
        <Buttons
          primaryDisable={!areSignaturesSufficient()}
          primaryLoading={broadcasting}
          primaryText={'Broadcast'}
          primaryCallback={() => {
            if (areSignaturesSufficient()) {
              setBroadcasting(true);
              dispatch(
                sendPhaseThree({
                  wallet: defaultVault,
                  txnPriority: TxPriority.LOW,
                })
              );
            } else {
              Alert.alert(`Sorry there aren't enough signatures!`);
            }
          }}
        />
      </Box>
      <SignerModals
        signers={signers}
        activeSignerId={activeSignerId}
        coldCardModal={coldCardModal}
        tapsignerModal={tapsignerModal}
        ledgerModal={ledgerModal}
        otpModal={otpModal}
        passwordModal={passwordModal}
        setColdCardModal={setColdCardModal}
        setLedgerModal={setLedgerModal}
        setPasswordModal={setPasswordModal}
        setTapsignerModal={setTapsignerModal}
        showOTPModal={showOTPModal}
        signTransaction={signTransaction}
        LedgerCom={LedgerCom}
        textRef={textRef}
      />
      <NfcPrompt visible={nfcVisible || TSNfcVisible} />
    </ScreenWrapper>
  );
};

export default SignTransactionScreen;
