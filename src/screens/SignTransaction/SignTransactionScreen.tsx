import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppClient, { DefaultWalletPolicy, PsbtV2, WalletPolicy } from 'src/hardware/ledger';
import { Box, DeleteIcon, Pressable, Text } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SignerType, TxPriority } from 'src/core/wallets/enums';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { sendPhaseThree, updatePSBTSignatures } from 'src/store/sagaActions/send_and_receive';

import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import CheckIcon from 'src/assets/images/checked.svg';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import Header from 'src/components/Header';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import NFC from 'src/core/services/nfc';
import Next from 'src/assets/images/svgs/icon_arrow.svg';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { NfcTech } from 'react-native-nfc-manager';
import Note from 'src/components/Note/Note';
import { RFValue } from 'react-native-responsive-fontsize';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SerializedPSBTEnvelop } from 'src/core/wallets/interfaces';
import SigningServer from 'src/core/services/operations/SigningServer';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { WalletMap } from '../Vault/WalletMap';
import WalletOperations from 'src/core/wallets/operations';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { cloneDeep } from 'lodash';
import config from 'src/core/config';
import { finaliseVaultMigration } from 'src/store/sagaActions/vaults';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { hash512 } from 'src/core/services/operations/encryption';
import idx from 'idx';
import moment from 'moment';
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

const SignWith = ({
  signer,
  callback,
  envelops,
}: {
  signer: VaultSigner;
  callback: any;
  envelops: SerializedPSBTEnvelop[];
}) => {
  const hasSignerSigned = !!envelops.filter(
    (psbt) => psbt.signerId === signer.signerId && psbt.isSigned
  ).length;
  return (
    <TouchableOpacity onPress={callback}>
      <Box m={5}>
        <Box flexDirection={'row'} borderRadius={10} justifyContent={'space-between'}>
          <Box flexDirection={'row'}>
            <View style={styles.inheritenceView}>
              <Box
                width={30}
                height={30}
                borderRadius={30}
                bg={'#FAC48B'}
                justifyContent={'center'}
                alignItems={'center'}
                marginX={1}
              >
                {WalletMap(signer.type).Icon}
              </Box>
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
                {`Added on ${moment(signer.addedOn).calendar()}`}
              </Text>
            </View>
          </Box>
          <Box alignItems={'center'} justifyContent={'center'}>
            {hasSignerSigned ? <CheckIcon /> : <Next />}
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};
const SignTransactionScreen = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const { signers, id: vaultId }: { signers: VaultSigner[]; id: string } = useQuery(
    RealmSchema.Vault
  ).map(getJSONFromRealmObject)[0];
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  const [coldCardModal, setColdCardModal] = useState(false);
  const [tapsignerModal, setTapsignerModal] = useState(false);
  const [ledgerModal, setLedgerModal] = useState(false);
  const [nfcVisible, setNfcVisible] = useState(false);
  const [otpModal, showOTPModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const { pinHash } = useAppSelector((state) => state.storage);

  const [activeSignerId, setActiveSignerId] = useState<string>();
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
  const serializedPSBTEnvelops = useAppSelector(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const isMigratingNewVault = useAppSelector((state) => state.vault.isMigratingNewVault);
  const sendSuccessful = useAppSelector((state) => state.sendAndReceive.sendPhaseThree.txid);
  const [broadcasting, setBroadcasting] = useState(false);
  const textRef = useRef(null);
  const dispatch = useDispatch();
  const defaultVault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
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
      updatePSBTSignatures({ signedSerializedPSBT: payload.psbt, signerId: activeSignerId })
    );
  };

  useEffect(() => {
    if (isMigratingNewVault) {
      if (sendSuccessful) {
        dispatch(finaliseVaultMigration(vaultId));
        navigation.dispatch(CommonActions.navigate({ name: 'VaultDetails' }));
      } else {
        return;
      }
    } else {
      if (sendSuccessful) {
        navigation.dispatch(CommonActions.navigate({ name: 'VaultDetails' }));
      }
    }
  }, [sendSuccessful, isMigratingNewVault]);

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
    async (signingServerOTP?: string) => {
      if (serializedPSBTEnvelops && serializedPSBTEnvelops.length) {
        const serializedPSBTEnvelop = serializedPSBTEnvelops.filter(
          (envelop) => envelop.signerId === activeSignerId
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
        } else if (SignerType.COLDCARD === signerType) {
          try {
            setColdCardModal(false);
            setNfcVisible(true);
            const psbtBytes = NFC.encodeForColdCard(serializedPSBTEnvelop.serializedPSBT);
            await NFC.send([NfcTech.Ndef], psbtBytes);
            setNfcVisible(false);
          } catch (error) {
            setNfcVisible(false);
            console.log({ error });
          }
        } else if (SignerType.LEDGER === signerType) {
          try {
            setLedgerModal(false);
            const app = new AppClient(LedgerCom.current);
            const buff = Buffer.from(serializedPSBTEnvelop.serializedPSBT, 'base64');
            const multisigWalletPolicy = new WalletPolicy(
              'ColdStorage',
              'sh(wsh(sortedmulti(1,@0,@1)))',
              signers.map((signer) => {
                const path = `${signer.xpubInfo.xfp}${signer.xpubInfo.derivationPath.slice(
                  signer.xpubInfo.derivationPath.indexOf('/')
                )}`;
                return `[${path}]${signer.xpub}/**`;
              })
            );
            const [policyId, policyHmac] = await app.registerWallet(multisigWalletPolicy);
            const psbt = new PsbtV2(); //??
            psbt.deserialize(buff);
            console.log({ psbt });
            const signed = await app.signPsbt(psbt, multisigWalletPolicy, null);
            console.log(signed);
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
          const { signedSerializedPSBT } = WalletOperations.signVaultPSBT(
            defaultVault,
            inputs,
            serializedPSBT,
            signer
          );
          dispatch(updatePSBTSignatures({ signedSerializedPSBT, signerId }));
        } else if (SignerType.POLICY_SERVER === signerType) {
          try {
            showOTPModal(false);
            const childIndexArray = idx(signingPayload, (_) => _[0].childIndexArray);
            if (!childIndexArray) throw new Error('Invalid signing payload');
            const { signedPSBT } = await SigningServer.signPSBT(
              keeper.id,
              Number(signingServerOTP),
              serializedPSBT,
              childIndexArray
            );
            if (!signedPSBT) throw new Error('signing server: failed to sign');
            dispatch(updatePSBTSignatures({ signedSerializedPSBT: signedPSBT, signerId }));
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

  const passwordEnter = () => {
    const onPressNumber = (text) => {
      let tmpPasscode = password;
      if (password.length < 4) {
        if (text != 'x') {
          tmpPasscode += text;
          setPassword(tmpPasscode);
        }
      }
      if (password && text == 'x') {
        setPassword(password.slice(0, -1));
      }
    };

    const onDeletePressed = (text) => {
      setPassword(password.slice(0, password.length - 1));
    };

    return (
      <Box width={hp(280)}>
        <Box>
          <CVVInputsView
            passCode={password}
            passcodeFlag={false}
            backgroundColor={true}
            textColor={true}
            length={4}
          />
          <Text
            fontSize={13}
            fontWeight={200}
            letterSpacing={0.65}
            width={wp(290)}
            color={'light.modalText'}
            marginTop={2}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et
          </Text>
          <Box mt={10} alignSelf={'flex-end'} mr={2}>
            <Box>
              <CustomGreenButton
                onPress={() => {
                  const currentPinHash = hash512(password);
                  if (currentPinHash === pinHash) {
                    signTransaction();
                  } else Alert.alert('Incorrect password. Try again!');
                }}
                value={'Confirm'}
              />
            </Box>
          </Box>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={'light.lightBlack'}
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    );
  };

  const otpContent = useCallback(() => {
    const [otp, setOtp] = useState('');

    const onPressNumber = (text) => {
      let tmpPasscode = otp;
      if (otp.length < 6) {
        if (text != 'x') {
          tmpPasscode += text;
          setOtp(tmpPasscode);
        }
      }
      if (otp && text == 'x') {
        setOtp(otp.slice(0, -1));
      }
    };

    const onDeletePressed = (text) => {
      setOtp(otp.slice(0, otp.length - 1));
    };

    return (
      <Box width={hp(280)}>
        <Box>
          <CVVInputsView
            passCode={otp}
            passcodeFlag={false}
            backgroundColor={true}
            textColor={true}
          />
          <Text
            fontSize={13}
            fontWeight={200}
            letterSpacing={0.65}
            width={wp(290)}
            color={'light.modalText'}
            marginTop={2}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et
          </Text>
          <Box mt={10} alignSelf={'flex-end'} mr={2}>
            <Box>
              <CustomGreenButton
                onPress={() => {
                  signTransaction(otp);
                }}
                value={'proceed'}
              />
            </Box>
          </Box>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor={'light.lightBlack'}
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    );
  }, [activeSignerId]);

  const callbackForSigners = ({ type, signerId }: VaultSigner) => {
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
        showOTPModal(true);
        break;
      default:
        Alert.alert(`action not set for ${type}`);
        break;
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Sign Transaction" subtitle="Lorem ipsum dolor sit amet," />
      <FlatList
        data={signers}
        keyExtractor={(item) => item.signerId}
        renderItem={({ item }) => (
          <SignWith
            signer={item}
            callback={() => callbackForSigners(item)}
            envelops={serializedPSBTEnvelops}
          />
        )}
      />
      <Box alignItems={'flex-end'} marginY={5}>
        {broadcasting ? (
          <ActivityIndicator size={30} style={{ marginHorizontal: '10%' }} />
        ) : (
          <Buttons
            primaryText={'Boradcast'}
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
        )}
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
        DarkCloseIcon={true}
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
        DarkCloseIcon={true}
        Content={() => <LedgerContent onSelectDevice={onSelectDevice} />}
      />
      <NfcPrompt visible={nfcVisible} />
      <KeeperModal
        visible={passwordModal}
        close={() => {
          setPasswordModal(false);
        }}
        title={'Enter your password'}
        subTitle={'Lorem ipsum dolor sit amet, '}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        textColor={'#041513'}
        Content={passwordEnter}
      />
      <KeeperModal
        visible={otpModal}
        close={() => {
          showOTPModal(false);
        }}
        title={'Confirm OTP to setup 2FA'}
        subTitle={'Lorem ipsum dolor sit amet, '}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        textColor={'#041513'}
        Content={otpContent}
      />
    </ScreenWrapper>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    backgroundColor: 'light.ReceiveBackground',
    padding: '20@s',
  },
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
