import React, { useState, useRef } from 'react';
import { Text, StyleSheet, SafeAreaView } from 'react-native';
import useSignerMap from 'src/hooks/useSignerMap';
import SignerModals from './SignTransaction/SignerModals';
import { RKInteractionMode, SignerType } from 'src/services/wallets/enums';
import { useNavigation } from '@react-navigation/native';
import {
  signTransactionWithColdCard,
  signTransactionWithTapsigner,
} from './SignTransaction/signWithSD';
import useTapsignerModal from 'src/hooks/useTapsignerModal';
import { CKTapCard } from 'cktap-protocol-react-native';
import useNfcModal from 'src/hooks/useNfcModal';
import NfcPrompt from 'src/components/NfcPromptAndroid';

export const SignPSBTScreen = ({ route }: any) => {
  const { data } = route.params;
  const { serializedPSBTEnvelop, signer, vault, vaultId, vaultKey, isMultiSig } = data;

  const [coldCardModal, setColdCardModal] = useState(false);
  const [passportModal, setPassportModal] = useState(false);
  const [ledgerModal, setLedgerModal] = useState(false);
  const [trezorModal, setTrezorModal] = useState(false);
  const [bitbox02modal, setBitbox02modal] = useState(false);

  const [seedSignerModal, setSeedSignerModal] = useState(false);
  const [keystoneModal, setKeystoneModal] = useState(false);
  const [jadeModal, setJadeModal] = useState(false);

  const [specterModal, setSpecterModal] = useState(false);
  const [tapSignerModal, setTapSignerModal] = useState(false);

  const card = useRef(new CKTapCard()).current;
  const { withModal, nfcVisible: TSNfcVisible } = useTapsignerModal(card);
  const { withNfcModal, nfcVisible, closeNfc } = useNfcModal();

  const textRef = useRef(null);
  const { signerMap } = useSignerMap();
  const signerType = signer.type;
  const navigation = useNavigation();

  React.useEffect(() => {
    selectWalletModal();
  }, [data]);

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
        setTapSignerModal(true);
        break;

      default:
        break;
    }
  };

  const signTransaction = async () => {
    try {
      if (SignerType.TAPSIGNER === signerType) {
        const { signingPayload: signedPayload, signedSerializedPSBT } =
          await signTransactionWithTapsigner({
            setTapsignerModal: setTapSignerModal,
            signingPayload: serializedPSBTEnvelop.signingPayload,
            currentKey: vaultKey,
            withModal,
            defaultVault: vault,
            serializedPSBT: serializedPSBTEnvelop.serializedPSBT,
            card,
            cvc: textRef.current,
            signer,
          });
        navigation.replace('RemoteSharing', {
          isPSBTSharing: true,
          signerData: {},
          signer: signer,
          psbt: signedSerializedPSBT || signedPayload,
          mode: RKInteractionMode.SHARE_SIGNED_PSBT,
          vaultKey: vaultKey,
          vaultId: vaultId,
        });
      } else if (SignerType.COLDCARD === signerType) {
        console.log('signTransaction CC modal');
        await signTransactionWithColdCard({
          setColdCardModal,
          withNfcModal,
          serializedPSBTEnvelop,
          closeNfc,
        });
      }
    } catch (error) {
      console.log('🚀 ~ signTransaction ~ error:', error);
    }
  };

  const onFileSign = (signedSerializedPSBT: string) => {
    navigation.replace('RemoteSharing', {
      isPSBTSharing: true,
      signerData: {},
      signer: signer,
      psbt: signedSerializedPSBT,
      mode: RKInteractionMode.SHARE_SIGNED_PSBT,
      vaultKey: vaultKey,
      vaultId: vaultId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text onPress={() => setColdCardModal(!coldCardModal)}>
        Text from SignPSBTScreen component
      </Text>

      <NfcPrompt visible={nfcVisible || TSNfcVisible} close={closeNfc} />
      <SignerModals
        vaultId={vaultId}
        vaultKeys={[vaultKey]}
        activeXfp={vaultKey.xfp}
        coldCardModal={coldCardModal}
        tapsignerModal={tapSignerModal}
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
        setTapsignerModal={setTapSignerModal}
        showOTPModal={false}
        signTransaction={signTransaction}
        textRef={textRef}
        isMultisig={isMultiSig}
        signerMap={signerMap}
        onFileSign={onFileSign}
        isRemoteKey={true}
        serializedPSBTEnvelopFromProps={serializedPSBTEnvelop}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
