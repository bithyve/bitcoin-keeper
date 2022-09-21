import { Box, DeleteIcon, Text, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NetworkType, SignerStorage, SignerType } from 'src/core/wallets/enums';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import Buttons from 'src/components/Buttons';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import Header from 'src/components/Header';
import InfoBox from '../../components/InfoBox';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import QRCode from 'react-native-qrcode-svg';
import { RFValue } from 'react-native-responsive-fontsize';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { authenticator } from 'otplib';
import config from 'src/core/config';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import idx from 'idx';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { validateSigningServerRegistration } from 'src/store/sagaActions/wallets';

const SetupSigningServer = ({ route }: { route }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [validationModal, showValidationModal] = useState(false);
  const [twoFAKey, setTwoFAKey] = useState('');
  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const key = idx(keeper, (_) => _.twoFADetails.twoFAKey);
  const isTwoFAAlreadyVerified = idx(keeper, (_) => _.twoFADetails.twoFAValidated);
  const signingServerVerified = useAppSelector((state) => state.wallet.signingServer.verified);
  const signingServerXpub = idx(keeper, (_) => _.twoFADetails.signingServerXpub);

  const [settingSigningServerKey, setSettingSigningServerKey] = useState(false);

  useEffect(() => {
    if (key) setTwoFAKey(key);
  }, [key]);

  useEffect(() => {
    if ((signingServerVerified || isTwoFAAlreadyVerified) && !settingSigningServerKey) {
      setSettingSigningServerKey(true);
      setupSigningServerKey();
    }
  }, [signingServerVerified, isTwoFAAlreadyVerified]);

  const setupSigningServerKey = async () => {
    const networkType = config.NETWORK_TYPE;
    const network = WalletUtilities.getNetworkByType(networkType);
    // const { xpub, xpriv, derivationPath, masterFingerprint, bip85Config } = await generateMobileKey(
    //   primaryMnemonic,
    //   networkType
    // );

    const signingServerKey: VaultSigner = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(signingServerXpub, network),
      type: SignerType.POLICY_SERVER,
      signerName: 'Signing Server',
      xpub: signingServerXpub,
      lastHealthCheck: new Date(),
      addedOn: new Date(),
      storageType: SignerStorage.WARM,
    };

    dispatch(addSigningDevice(signingServerKey));
    navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
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
                  dispatch(validateSigningServerRegistration(Number(otp)));
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
  }, []);

  return (
    <View style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <Header
          title={'Set up 2FA for Signing Server'}
          subtitle={'Lorem ipsum dolor sit amet,'}
          onPressHandler={() => navigation.goBack()}
          headerTitleColor={'light.headerText'}
        />
      </Box>
      <Box marginTop={hp(50)} alignItems={'center'} alignSelf={'center'} width={hp(250)}>
        <Text
          color={'light.recieverAddress'}
          fontFamily={'body'}
          fontWeight={300}
          fontSize={12}
          letterSpacing={1.08}
          width={hp(250)}
          noOfLines={1}
          style={{
            marginVertical: hp(30),
          }}
        >
          Scan the QR below to add Backup Key
        </Text>
        <QRCode
          value={authenticator.keyuri('bitcoin-keeper.io', 'Keeper', twoFAKey)}
          logoBackgroundColor="transparent"
          size={hp(250)}
        />
      </Box>

      {/* {Bottom note} */}
      <Box position={'absolute'} bottom={hp(45)} marginX={5}>
        <Box marginBottom={hp(30)}>
          <InfoBox
            title={'Note'}
            desciption={
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'
            }
            width={300}
          />
        </Box>
        <Buttons
          primaryCallback={() => {
            showValidationModal(true);
          }}
          primaryText={'Next'}
          secondaryText={'Cancel'}
          secondaryCallback={() => {
            navigation.goBack();
          }}
        />
      </Box>
      <KeeperModal
        visible={validationModal}
        close={() => {
          showValidationModal(false);
        }}
        title={'Confirm OTP to setup 2FA'}
        subTitle={'Lorem ipsum dolor sit amet, '}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        textColor={'#041513'}
        Content={otpContent}
      />
    </View>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    position: 'relative',
  },
  title: {
    fontSize: RFValue(12),
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: RFValue(10),
    letterSpacing: '0.20@s',
  },
  textBox: {
    width: '80%',
    // backgroundColor: Colors?.textInputBackground,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
  },
});
export default SetupSigningServer;
