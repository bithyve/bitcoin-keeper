import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppClient, { DefaultWalletPolicy, PsbtV2, WalletPolicy } from 'src/hardware/ledger';
import { Box, Pressable, Text } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ndef, NfcTech } from 'react-native-nfc-manager';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { SignerType, TxPriority } from 'src/core/wallets/enums';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import { CKTapCard } from 'cktap-protocol-react-native';
import Header from 'src/components/Header';
import KeeperModal from 'src/components/KeeperModal';
import NFC from 'src/core/services/nfc';
import Next from 'src/assets/images/svgs/icon_arrow.svg';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import Note from 'src/components/Note/Note';
import { RFValue } from 'react-native-responsive-fontsize';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { SignerMap } from '../NewHomeScreen/SignerMap';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { cloneDeep } from 'lodash';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { sendPhaseThree } from 'src/store/sagaActions/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import useScanLedger from '../AddLedger/useScanLedger';

const { width } = Dimensions.get('screen');

const InputCvc = ({ textRef }) => {
  return (
    <TextInput
      style={styles.input}
      secureTextEntry={true}
      onChangeText={(text) => {
        textRef.current = text;
      }}
    />
  );
};
const PSTBCard = ({ message, buttonText, buttonCallBack }) => {
  return (
    <Box
      backgroundColor={'light.lightYellow'}
      height={hp(100)}
      width={wp(295)}
      borderRadius={10}
      justifyContent={'center'}
      marginY={3}
    >
      <Box
        style={{
          paddingHorizontal: wp(20),
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text
          color={'light.modalText'}
          fontSize={13}
          letterSpacing={0.65}
          fontWeight={200}
          noOfLines={2}
          width={wp(175)}
        >
          {message}
        </Text>
        <Pressable
          bg={'light.yellow1'}
          justifyContent={'center'}
          borderRadius={5}
          width={wp(60)}
          height={hp(25)}
          alignItems={'center'}
          onPress={buttonCallBack}
        >
          <Text fontSize={12} letterSpacing={0.65} fontWeight={200}>
            {buttonText}
          </Text>
        </Pressable>
      </Box>
    </Box>
  );
};
const ColdCardContent = ({ broadcast, send }) => {
  return (
    <Box>
      <PSTBCard
        message={'Send Assigned PSBT Lorem ipsum dolor sit amet, consectetur adipiscing elit'}
        buttonText={'Send'}
        buttonCallBack={send}
      />
      <PSTBCard
        message={'Recieve Assigned PSBT Lorem ipsum dolor sit amet, consectetur adipiscing elit'}
        buttonText={'Recieve'}
        buttonCallBack={broadcast}
      />
      <Box marginTop={2} width={wp(220)}>
        <Text color={'light.modalText'} fontSize={13} letterSpacing={0.65} noOfLines={2}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
        </Text>
      </Box>
    </Box>
  );
};

const DeviceItem = ({ device, onSelectDevice }) => {
  const [pending, setPending] = useState(false);
  const onPress = async () => {
    setPending(true);
    try {
      await onSelectDevice(device);
    } catch (error) {
      console.log(error);
    } finally {
      setPending(false);
    }
  };
  return (
    <TouchableOpacity onPress={() => onPress()} style={{ flexDirection: 'row' }}>
      <Text
        color={'light.textLight'}
        fontSize={RFValue(14)}
        fontWeight={200}
        fontFamily={'heading'}
        letterSpacing={1.12}
      >
        {device.name}
      </Text>
      {pending ? <ActivityIndicator /> : null}
    </TouchableOpacity>
  );
};

const LedgerContent = ({ onSelectDevice }) => {
  const { error, devices, scanning } = useScanLedger();

  if (error) {
    <Text style={styles.errorTitle}>{String(error.message)}</Text>;
  }
  return (
    <>
      {scanning ? <ActivityIndicator /> : null}
      {devices.map((device) => (
        <DeviceItem device={device} onSelectDevice={onSelectDevice} key={device.id} />
      ))}
    </>
  );
};

const SignWith = ({ signer, callback }: { signer: VaultSigner; callback: any }) => {
  return (
    <TouchableOpacity onPress={callback}>
      <Box m={5}>
        <Box flexDirection={'row'} borderRadius={10} justifyContent={'space-between'}>
          <Box flexDirection={'row'}>
            <View style={styles.inheritenceView}>
              <SignerMap type={signer.type} />
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Text
                color={'light.textBlack'}
                fontSize={RFValue(14)}
                fontWeight={200}
                fontFamily={'heading'}
                letterSpacing={1.12}
              >
                {signer.signerName}
              </Text>
              <Text
                color={'light.GreyText'}
                fontSize={RFValue(12)}
                marginRight={10}
                fontFamily={'body'}
                letterSpacing={0.6}
              >
                {`Added on 4th of July`}
              </Text>
            </View>
          </Box>
          <Box alignItems={'center'} justifyContent={'center'}>
            <Next />
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};
const SignTransactionScreen = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const { signers } = useQuery(RealmSchema.Vault).map(getJSONFromRealmObject)[0];

  const [coldCardModal, setColdCardModal] = useState(false);
  const [tapsignerModal, setTapsignerModal] = useState(false);
  const [ledgerModal, setLedgerModal] = useState(false);
  const [nfcVisible, setNfcVisible] = useState(false);
  const LedgerCom = useRef();
  const onSelectDevice = useCallback(async (device) => {
    try {
      const transport = await TransportBLE.open(device);
      transport.on('disconnect', () => {
        LedgerCom.current = null;
      });
      LedgerCom.current = transport;
      signTransaction();
    } catch (e) {
      console.log(e);
    }
  }, []);

  const navigation = useNavigation();
  const serializedPSBTEnvelop = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelop
  );
  const textRef = useRef(null);
  const dispatch = useDispatch();
  const defaultVault: Vault = useQuery(RealmSchema.Vault).map(getJSONFromRealmObject)[0];
  const card = useRef(new CKTapCard()).current;

  const receiveAndBroadCast = async () => {
    setNfcVisible(true);
    const signedPSBT = await NFC.read(NfcTech.NfcV);
    setNfcVisible(false);
    const payload = {
      name: '',
      signature: '',
      psbt: '',
    };
    signedPSBT.forEach((record) => {
      if (record.data === 'Partly signed PSBT') {
        payload.name = record.data;
      }
      // signature is of length 64 but 44 when base64 encoded
      else if (record.data.length === 44) {
        payload.signature = record.data;
      } else {
        payload.psbt = record.data;
      }
    });
    dispatch(
      sendPhaseThree({
        wallet: defaultVault,
        txnPriority: TxPriority.LOW,
        serializedPSBTEnvelop: { signerType: SignerType.COLDCARD, serializedPSBT: payload.psbt },
      })
    );
    navigation.dispatch(CommonActions.navigate({ name: 'VaultDetails' }));
  };

  const signTransaction = useCallback(async () => {
    if (serializedPSBTEnvelop) {
      const copySerializedPSBTEnvelop = cloneDeep(serializedPSBTEnvelop);
      const { signerType, signingDataHW } = copySerializedPSBTEnvelop;
      switch (signerType) {
        case SignerType.TAPSIGNER: {
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
          const { inputsToSign } = signingDataHW[0];
          withModal(async () => {
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
                dispatch(
                  sendPhaseThree({
                    wallet: defaultVault,
                    txnPriority: TxPriority.LOW,
                    serializedPSBTEnvelop: copySerializedPSBTEnvelop,
                  })
                );
                navigation.dispatch(CommonActions.navigate({ name: 'VaultDetails' }));
              } else {
                Alert.alert('Please setup card before signing!');
              }
            } catch (e) {
              console.log(e);
            }
          })().catch(console.log);
        }
        case SignerType.COLDCARD: {
          try {
            setColdCardModal(false);
            setNfcVisible(true);
            const psbtBytes = Ndef.encodeMessage([
              Ndef.textRecord(serializedPSBTEnvelop.serializedPSBT),
            ]);
            await NFC.send([NfcTech.Ndef], psbtBytes);
            setNfcVisible(false);
          } catch (error) {
            setNfcVisible(false);
            console.log({ error });
          }
        }
        case SignerType.LEDGER: {
          try {
            setLedgerModal(false);
            const app = new AppClient(LedgerCom.current);
            const buff = Buffer.from(serializedPSBTEnvelop.serializedPSBT, 'base64');
            const mfp = await app.getMasterFingerprint();
            const path = `${mfp}/44'/1'/0'`; // HD derivation path
            const walletPolicy = new DefaultWalletPolicy(
              'wpkh(@0)',
              `[${path}]${signers[0].xpub}/**`
            );
            const change = 0;
            const addressIndex = 0;
            const firstAccountAddress = await app.getWalletAddress(
              walletPolicy,
              null,
              change,
              addressIndex,
              true // show address on the wallet's screen
            );
            // WIP
            console.log('First account receive address:', firstAccountAddress);
            console.log(`[${path}]${signers[0].xpub}/**`);
            const psbt = new PsbtV2(); //??
            psbt.deserialize(buff);
            console.log({ psbt });
            await app.signPsbt(psbt, walletPolicy, null);
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
        }
        default: {
          break;
        }
      }
    }
  }, [serializedPSBTEnvelop]);

  const callbackForSigners = (type: SignerType) => {
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
      default:
        Alert.alert(`action not set for ${type}`);
        break;
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: 'light.ReceiveBackground',
        paddingTop: 40,
      }}
    >
      <Box paddingX={5} marginTop={hp(5)}>
        <Box marginY={5}>
          <Header title="Sign Transaction" subtitle="Lorem ipsum dolor sit amet," />
        </Box>
        <FlatList
          data={signers}
          keyExtractor={({ item }) => item?.id}
          renderItem={({ item }) => (
            <SignWith signer={item} callback={() => callbackForSigners(item.type)} />
          )}
        />
      </Box>
      <Box alignItems={'flex-start'} marginY={5}>
        <Note
          title={'Note'}
          subtitle={
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'
          }
          subtitleColor={'GreyText'}
          width={wp(300)}
        />
      </Box>
      <KeeperModal
        visible={coldCardModal}
        close={() => setColdCardModal(false)}
        title={'Upload Multi-sig data'}
        subTitle={'Keep your ColdCard ready before proceeding'}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        Content={() => <ColdCardContent broadcast={receiveAndBroadCast} send={signTransaction} />}
      />
      <KeeperModal
        visible={tapsignerModal}
        close={() => setTapsignerModal(false)}
        title={'Enter CVC'}
        subTitle={'Please enter the 6-32 digit CVC of the TapSigner'}
        modalBackground={['#00836A', '#073E39']}
        buttonBackground={['#FFFFFF', '#80A8A1']}
        buttonText={'SIGN'}
        buttonTextColor={'#073E39'}
        buttonCallback={signTransaction}
        textColor={'#FFF'}
        Content={() => InputCvc({ textRef })}
      />
      <KeeperModal
        visible={ledgerModal}
        close={() => setLedgerModal(false)}
        title={'Looking for Nano X'}
        subTitle={'Power up your Ledger Nano X and open the BTC app...'}
        modalBackground={['#00836A', '#073E39']}
        buttonBackground={['#FFFFFF', '#80A8A1']}
        buttonText={LedgerCom.current ? 'SIGN' : false}
        buttonTextColor={'#073E39'}
        buttonCallback={signTransaction}
        textColor={'#FFF'}
        Content={() => <LedgerContent onSelectDevice={onSelectDevice} />}
      />
      <NfcPrompt visible={nfcVisible} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 20,
    marginVertical: '3%',
    width: width * 0.7,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f0e7dd',
    letterSpacing: 5,
  },
  inheritenceView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    backgroundColor: '#E3E3E3',
    borderRadius: 30,
    marginRight: 20,
    alignSelf: 'center',
  },

  errorTitle: {
    color: '#c00',
    fontSize: 16,
  },
});

export default SignTransactionScreen;
