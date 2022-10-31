import { Alert, FlatList, Platform } from 'react-native';
import AppClient, { PsbtV2, WalletPolicy } from 'src/hardware/ledger';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NetworkType, SignerType, TxPriority } from 'src/core/wallets/enums';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { sendPhaseThree, updatePSBTSignatures } from 'src/store/sagaActions/send_and_receive';

import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { NfcTech } from 'react-native-nfc-manager';
import Note from 'src/components/Note/Note';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SignerList from './SignerList';
import SignerModals from './SignerModals';
import SigningServer from 'src/core/services/operations/SigningServer';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletOperations from 'src/core/wallets/operations';
import { cloneDeep } from 'lodash';
import config from 'src/core/config';
import dbManager from 'src/storage/realm/dbManager';
import { finaliseVaultMigration } from 'src/store/sagaActions/vaults';
import { generateSeedWordsKey } from 'src/core/wallets/factories/VaultFactory';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import idx from 'idx';
import { sendPhaseThreeReset } from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import HeaderTitle from 'src/components/HeaderTitle';
import { hp } from 'src/common/data/responsiveness/responsive';

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
  const [nfcVisible, setNfcVisible] = useState(false);
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
          setTapsignerModal(false);
          const withModal = (callback) => {
            return Platform.select({
              android: async () => {
                setNfcVisible(true);
                const resp = await card.nfcWrapper(callback);
                setNfcVisible(false);
                return resp;
              },
              ios: async () => card.nfcWrapper(callback),
            });
          };
          const { inputsToSign } = signingPayload[0];
          //AMF flow for signing
          if (currentSigner.amfData && currentSigner.amfData.xpub) {
            await withModal(async () => {
              await card.first_look();
              await card.read(textRef.current);
            })();
            const { xpriv } = currentSigner;
            const inputs = idx(signingPayload, (_) => _[0].inputsToSign);
            if (!inputs) throw new Error('Invalid signing payload, inputs missing');
            const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
              defaultVault,
              inputs,
              serializedPSBT,
              xpriv
            );
            dispatch(updatePSBTSignatures({ signedSerializedPSBT, signerId }));
          } else {
            await withModal(async () => {
              try {
                const status = await card.first_look();
                if (status.path) {
                  for (let i = 0; i < inputsToSign.length; i++) {
                    const input = inputsToSign[i];
                    const digest = Buffer.from(input.digest, 'hex');
                    const subpath = input.subPath;
                    const signature = await card.sign_digest(textRef.current, 0, digest, subpath);
                    input.signature = signature.slice(1).toString('hex');
                  }
                  dispatch(updatePSBTSignatures({ signingPayload, signerId }));
                } else {
                  Alert.alert('Please setup card before signing!');
                }
              } catch (e) {
                console.log(e);
              }
            })().catch(console.log);
          }
        } else if (SignerType.COLDCARD === signerType) {
          try {
            setColdCardModal(false);
            setNfcVisible(true);
            const psbtBytes = NFC.encodeForColdCard(serializedPSBTEnvelop.serializedPSBT);
            await NFC.send([NfcTech.Ndef], psbtBytes);
            setNfcVisible(false);
            const updatedSigners = getJSONFromRealmObject(signers).map((signer: VaultSigner) => {
              if (signer.signerId === activeSignerId) {
                signer.hasSigned = true;
                return signer;
              } else {
                return signer;
              }
            });
            dbManager.updateObjectById(RealmSchema.Vault, defaultVault.id, {
              signers: updatedSigners,
            });
          } catch (error) {
            setNfcVisible(false);
            console.log({ error });
          }
        } else if (SignerType.LEDGER === signerType) {
          try {
            setLedgerModal(false);
            if (currentSigner.amfData && currentSigner.amfData.xpub) {
              const { xpriv } = currentSigner;
              const inputs = idx(signingPayload, (_) => _[0].inputs);
              if (!inputs) throw new Error('Invalid signing payload, inputs missing');
              const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
                defaultVault,
                inputs,
                serializedPSBT,
                xpriv
              );
              dispatch(updatePSBTSignatures({ signedSerializedPSBT, signerId }));
            }
            // const app = new AppClient(LedgerCom.current);
            // const buff = Buffer.from(serializedPSBTEnvelop.serializedPSBT, 'base64');
            // const multisigWalletPolicy = new WalletPolicy(
            //   'ColdStorage',
            //   'sh(wsh(sortedmulti(1,@0,@1)))',
            //   signers.map((signer) => {
            //     const path = `${signer.xpubInfo.xfp}${signer.xpubInfo.derivationPath.slice(
            //       signer.xpubInfo.derivationPath.indexOf('/')
            //     )}`;
            //     return `[${path}]${signer.xpub}/**`;
            //   })
            // );
            // const [policyId, policyHmac] = await app.registerWallet(multisigWalletPolicy);
            // const psbt = new PsbtV2(); //??
            // psbt.deserialize(buff);
            // console.log({ psbt });
            // const signed = await app.signPsbt(psbt, multisigWalletPolicy, null);
            // console.log(signed);
          } catch (error) {
            switch (error.message) {
              case 'Ledger device: UNKNOWN_ERROR (0x6b0c)':
                Alert.alert('Unlock the device to connect.');
              case 'Ledger device: UNKNOWN_ERROR (0x6a15)':
                Alert.alert('Navigate to the correct app in the Ledger.');
              case 'Ledger device: UNKNOWN_ERROR (0x6511)':
                Alert.alert('Open up the correct app in the Ledger.'); // no app selected
              // unknown error
              default:
                break;
            }
            console.log({ error });
            Alert.alert(error.toString());
          }
        } else if (SignerType.MOBILE_KEY === signerType) {
          setPasswordModal(false);
          const inputs = idx(signingPayload, (_) => _[0].inputs);
          if (!inputs) throw new Error('Invalid signing payload, inputs missing');

          const [signer] = defaultVault.signers.filter((signer) => signer.signerId === signerId);
          const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
            defaultVault,
            inputs,
            serializedPSBT,
            signer.xpriv
          );
          dispatch(updatePSBTSignatures({ signedSerializedPSBT, signerId }));
        } else if (SignerType.POLICY_SERVER === signerType) {
          try {
            showOTPModal(false);
            const childIndexArray = idx(signingPayload, (_) => _[0].childIndexArray);
            const outgoing = idx(signingPayload, (_) => _[0].outgoing);

            if (!childIndexArray) throw new Error('Invalid signing payload');
            const { signedPSBT } = await SigningServer.signPSBT(
              keeper.id,
              signingServerOTP ? Number(signingServerOTP) : null,
              serializedPSBT,
              childIndexArray,
              outgoing
            );
            if (!signedPSBT) throw new Error('signing server: failed to sign');
            dispatch(updatePSBTSignatures({ signedSerializedPSBT: signedPSBT, signerId }));
          } catch (err) {
            Alert.alert(err.message);
          }
        } else if (SignerType.SEED_WORDS === signerType) {
          try {
            const inputs = idx(signingPayload, (_) => _[0].inputs);
            if (!inputs) throw new Error('Invalid signing payload, inputs missing');

            const [signer] = defaultVault.signers.filter((signer) => signer.signerId === signerId);
            const networkType = config.NETWORK_TYPE;
            const { xpub, xpriv } = generateSeedWordsKey(seedBasedSingerMnemonic, networkType);
            if (signer.xpub !== xpub) throw new Error('Invalid mnemonic; xpub mismatch');

            const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
              defaultVault,
              inputs,
              serializedPSBT,
              xpriv
            );
            dispatch(updatePSBTSignatures({ signedSerializedPSBT, signerId }));
          } catch (err) {
            Alert.alert(err);
          }
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
      <NfcPrompt visible={nfcVisible} />
    </ScreenWrapper>
  );
};

export default SignTransactionScreen;
