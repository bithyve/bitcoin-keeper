import { Box, Text, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { Alert } from 'react-native';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import LedgerImage from 'src/assets/images/ledger_image.svg';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import { NetworkType, SignerType } from 'src/core/wallets/enums';
import { StyleSheet } from 'react-native';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import AlertIllustration from 'src/assets/images/alert_illustration.svg';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import DeleteIcon from 'src/assets/icons/deleteBlack.svg';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import { generateMobileKey } from 'src/core/wallets/factories/VaultFactory';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { useDispatch } from 'react-redux';
import { APP_STAGE } from 'src/core/config';
import { useAppSelector } from 'src/store/hooks';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { hash512 } from 'src/core/services/operations/encryption';

const TapsignerSetupContent = () => {
  return (
    <View>
      <TapsignerSetupImage />
      <Box marginTop={'4'}>
        <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} p={1}>
          {`\u2022 You will need the Pin/CVC at the back of TAPSIGNER`}
        </Text>
        <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} p={1}>
          {'\u2022 Make sure that TAPSIGNER is not used as a Signer on other apps'}
        </Text>
      </Box>
    </View>
  );
};

const ColdCardSetupContent = () => {
  return (
    <View>
      <Box ml={wp(21)}>
        <ColdCardSetupImage />
      </Box>
      <Box marginTop={'4'}>
        <Box flex={1} flexDirection={'row'} alignItems={'space-between'} justifyContent={'center'}>
          <Box mb={hp(19)} mx={wp(10)}>
            <Text>{'\u2022 Step 1'}</Text>
          </Box>
          <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} mr={60}>
            Send Assigned PSBT Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </Text>
        </Box>
        <Box flex={1} flexDirection={'row'} alignItems={'space-between'} justifyContent={'center'}>
          <Box mb={hp(19)} mx={wp(10)}>
            <Text>{'\u2022 Step 2'}</Text>
          </Box>
          <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} mr={60}>
            Recieve Assigned PSBT Lorem ipsum dolor sit amet, consectetur
          </Text>
        </Box>
      </Box>
    </View>
  );
};
const LedgerSetupContent = () => {
  return (
    <View>
      <Box ml={wp(21)}>
        <LedgerImage />
      </Box>
      <Box marginTop={'4'} flex={1} alignItems={'center'} justifyContent={'center'}>
        <Box flex={1} flexDirection={'row'} alignItems={'space-between'} justifyContent={'center'}>
          <Box mb={hp(19)} mr={wp(19)}>
            <Text>{'\u2022'}</Text>
          </Box>
          <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} mr={60}>
            Send Assigned PSBT Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </Text>
        </Box>
        <Box flex={1} flexDirection={'row'} alignItems={'space-between'} justifyContent={'center'}>
          <Box mb={hp(19)} mr={wp(10)}>
            <Text>{'\u2022'}</Text>
          </Box>
          <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} mr={60}>
            Recieve Assigned PSBT Lorem ipsum dolor sit amet, consectetur
          </Text>
        </Box>
      </Box>
    </View>
  );
};

const BulletPoint = ({ description }: { description: string }) => {
  return (
    <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
      <Box width={2} height={2} borderRadius={10} backgroundColor={'light.modalText'} />
      <Text
        fontSize={13}
        fontWeight={200}
        letterSpacing={0.65}
        width={wp(260)}
        color={'light.modalText'}
        marginY={2}
        marginLeft={3}
      >
        {description}
      </Text>
    </Box>
  );
};

const otpContent = () => {
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et
        </Text>
        <Box mt={10} alignSelf={'flex-end'} mr={2}>
          <Box>
            <CustomGreenButton onPress={() => {}} value={'proceed'} />
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

const SettingSigningServer = () => {
  return (
    <Box>
      <AlertIllustration />
      <BulletPoint
        description={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'
        }
      />
      <BulletPoint
        description={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'
        }
      />
    </Box>
  );
};

const SetUpMobileKey = () => {
  return (
    <Box>
      <AlertIllustration />
      <BulletPoint
        description={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'
        }
      />
      <BulletPoint
        description={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'
        }
      />
    </Box>
  );
};

const HardwareModalMap = ({ type, visible, close }) => {
  const dispatch = useDispatch();

  const { translations } = useContext(LocalizationContext);
  const tapsigner = translations['tapsigner'];
  const coldcard = translations['coldcard'];
  const ledger = translations['ledger'];
  const [passwordModal, setPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const { pinHash } = useAppSelector((state) => state.storage);

  const { useQuery } = useContext(RealmWrapperContext);
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];

  const navigation = useNavigation();
  const navigateToTapsignerSetup = () => {
    close();
    navigation.dispatch(CommonActions.navigate({ name: 'AddTapsigner', params: {} }));
  };

  const navigateToColdCardSetup = () => {
    close();
    navigation.dispatch(CommonActions.navigate({ name: 'AddColdCard', params: {} }));
  };

  const navigateToLedgerSetup = () => {
    close();
    navigation.dispatch(CommonActions.navigate({ name: 'AddLedger', params: {} }));
  };

  const setupMobileKey = async () => {
    const networkType = APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET;
    const network = WalletUtilities.getNetworkByType(networkType);
    const { xpub, xpriv, derivationPath, masterFingerprint, bip85Config } = await generateMobileKey(
      primaryMnemonic,
      networkType
    );

    const mobileKey: VaultSigner = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
      type: SignerType.MOBILE_KEY,
      signerName: 'Mobile Key',
      xpub,
      xpriv,
      xpubInfo: {
        derivationPath,
        xfp: masterFingerprint,
      },
      bip85Config,
      lastHealthCheck: new Date(),
    };

    dispatch(addSigningDevice(mobileKey));
    navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
  };

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
                  if (currentPinHash === pinHash) setupMobileKey();
                  else Alert.alert('Incorrect password. Try again!');
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
  };

  return (
    <>
      <KeeperModal
        visible={visible && type === SignerType.TAPSIGNER}
        close={close}
        title={tapsigner.SetupTitle}
        subTitle={tapsigner.SetupDescription}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Setup'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToTapsignerSetup}
        textColor={'#041513'}
        Content={TapsignerSetupContent}
      />
      <KeeperModal
        visible={visible && type === SignerType.COLDCARD}
        close={close}
        title={coldcard.SetupTitle}
        subTitle={coldcard.SetupDescription}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Proceed'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToColdCardSetup}
        textColor={'#041513'}
        Content={ColdCardSetupContent}
      />
      <KeeperModal
        visible={visible && type === SignerType.LEDGER}
        close={close}
        title={ledger.SetupTitle}
        subTitle={ledger.SetupDescription}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Proceed'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToLedgerSetup}
        textColor={'#041513'}
        Content={LedgerSetupContent}
      />
      <KeeperModal
        visible={visible && type === SignerType.POLICY_SERVER}
        close={close}
        title={'Setting up a Signing Server'}
        subTitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed '}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Continue'}
        buttonTextColor={'#FAFAFA'}
        textColor={'#041513'}
        Content={SettingSigningServer}
      />
      <KeeperModal
        visible={visible && type === SignerType.MOBILE_KEY}
        close={close}
        title={'Set up a Mobile Key'}
        subTitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed '}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Continue'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={() => {
          close();
          setPasswordModal(true);
        }}
        textColor={'#041513'}
        Content={SetUpMobileKey}
      />
      <KeeperModal
        visible={false}
        close={() => {}}
        title={'Confirm OTP to setup 2FA'}
        subTitle={'Lorem ipsum dolor sit amet, '}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        textColor={'#041513'}
        Content={otpContent}
      />
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
    </>
  );
};

export default HardwareModalMap;

const styles = StyleSheet.create({});
