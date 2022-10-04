import { Box, Text, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NetworkType, SignerStorage, SignerType } from 'src/core/wallets/enums';
import React, { useContext, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import { Alert } from 'react-native';
import AlertIllustration from 'src/assets/images/alert_illustration.svg';
import SuccessIllustration from 'src/assets/images/success_illustration.svg';
import MobileKeyIllustration from 'src/assets/images/mobileKey_illustration.svg';
import SigningServerIllustration from 'src/assets/images/signingServer_illustration.svg';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import DeleteIcon from 'src/assets/icons/deleteBlack.svg';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import LedgerImage from 'src/assets/images/ledger_image.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { StyleSheet } from 'react-native';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import config from 'src/core/config';
import { generateMobileKey, generateSeedWordsKey } from 'src/core/wallets/factories/VaultFactory';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { hash512 } from 'src/core/services/operations/encryption';
import { registerWithSigningServer } from 'src/store/sagaActions/wallets';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import * as bip39 from 'bip39';

const SetupSuccessfully = () => {
  return (
    <Box width={wp(270)}>
      <Box alignItems={'center'}>
        <SuccessIllustration />
      </Box>
      <Box marginTop={hp(0)}>
        <Text
          color={'light.modalText'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={1}
          letterSpacing={0.65}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        </Text>
      </Box>
    </Box>
  );
};

const BulletPoint = ({ text }) => {
  return (
    <Box marginTop={'4'} flexDirection={'row'} alignItems={'center'}>
      <Box
        style={{
          height: hp(5),
          width: wp(5),
        }}
        backgroundColor={'light.modalText'}
        borderRadius={10}
        marginRight={wp(5)}
      />
      <Text
        color={'light.modalText'}
        fontSize={13}
        fontFamily={'body'}
        fontWeight={'200'}
        p={1}
        letterSpacing={1.65}
      >
        {text}
      </Text>
    </Box>
  );
};

const TapsignerSetupContent = () => {
  return (
    <View>
      <TapsignerSetupImage />
      <BulletPoint text={'You will need the Pin/CVC at the back of TAPSIGNER'} />
      <BulletPoint text={`Make sure that TAPSIGNER is not used as a Signer on other apps`} />
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
        <Box flex={1} flexDirection={'row'}>
          <Box mb={hp(19)} mx={wp(2)}>
            <Text>{'\u2022 Step 1'}</Text>
          </Box>
          <Text
            color={'#073B36'}
            fontSize={13}
            fontWeight={200}
            letterSpacing={0.65}
            style={{
              marginLeft: wp(10),
              width: wp(210),
            }}
          >
            Send Assigned PSBT Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </Text>
        </Box>
        <Box flex={1} flexDirection={'row'} marginTop={2}>
          <Box mb={hp(19)} mx={wp(2)}>
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

const SettingSigningServer = () => {
  return (
    <Box>
      <SigningServerIllustration />
      <BulletPoint
        text={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
      />
      <BulletPoint
        text={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
      />
    </Box>
  );
};

const SetUpMobileKey = () => {
  return (
    <Box>
      <MobileKeyIllustration />
      <BulletPoint
        text={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
      />
      <BulletPoint
        text={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
      />
    </Box>
  );
};

const SetupSeedWords = () => {
  return (
    <Box>
      <AlertIllustration />
      <BulletPoint
        text={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
      />
      <BulletPoint
        text={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
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

  const navigateToSigningServerSetup = () => {
    close();
    dispatch(registerWithSigningServer());
    navigation.dispatch(CommonActions.navigate({ name: 'SetupSigningServer', params: {} }));
  };

  const navigateToSeedWordSetup = () => {
    close();
    const mnemonic = bip39.generateMnemonic();
    navigation.dispatch(
      CommonActions.navigate({
        name: 'SetupSeedWordSigner',
        params: {
          seed: mnemonic,
          next: true,
          onSuccess: setupSeedWordsBasedKey,
        },
      })
    );
  };

  const setupMobileKey = async () => {
    const networkType = config.NETWORK_TYPE;
    const network = WalletUtilities.getNetworkByType(networkType);
    const { xpub, xpriv, derivationPath, masterFingerprint, bip85Config } = await generateMobileKey(
      primaryMnemonic,
      networkType
    );

    const mobileKey: VaultSigner = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
      type: SignerType.MOBILE_KEY,
      signerName: 'Mobile Key',
      storageType: SignerStorage.WARM,
      xpub,
      xpriv,
      xpubInfo: {
        derivationPath,
        xfp: masterFingerprint,
      },
      bip85Config,
      lastHealthCheck: new Date(),
      addedOn: new Date(),
    };

    dispatch(addSigningDevice(mobileKey));
    navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
  };

  const setupSeedWordsBasedKey = (mnemonic) => {
    const networkType = config.NETWORK_TYPE;
    const network = WalletUtilities.getNetworkByType(networkType);
    const { xpub, derivationPath, masterFingerprint } = generateSeedWordsKey(mnemonic, networkType);

    const softSigner: VaultSigner = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
      type: SignerType.SEED_WORDS,
      storageType: SignerStorage.WARM,
      signerName: 'Seed Words',
      xpub,
      xpubInfo: {
        derivationPath,
        xfp: masterFingerprint,
      },
      lastHealthCheck: new Date(),
      addedOn: new Date(),
    };

    dispatch(addSigningDevice(softSigner));
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
                  if (currentPinHash === pinHash) setupMobileKey();
                  else Alert.alert('Incorrect password. Try again!');
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
        buttonCallback={navigateToSigningServerSetup}
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
        visible={visible && type === SignerType.SEED_WORDS}
        close={close}
        title={'Setup Seed Words Based Signer'}
        subTitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed '}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Continue'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToSeedWordSetup}
        textColor={'#041513'}
        Content={SetupSeedWords}
      />
      <KeeperModal
        visible={false}
        close={close}
        title={'Signing Server Setup Successfully'}
        subTitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed'}
        subTitleColor={'#5F6965'}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'View Vault'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={() => { console.log('View Vault') }}
        textColor={'#041513'}
        Content={SetupSuccessfully}
      />
    </>
  );
};

export default HardwareModalMap;

const styles = StyleSheet.create({});
