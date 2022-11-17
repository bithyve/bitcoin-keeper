import {
  Alert,
  FlatList,
  InteractionManager,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Box, Button, HStack, Text, VStack, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NetworkType, SignerStorage, SignerType } from 'src/core/wallets/enums';
import React, { useContext, useEffect, useState } from 'react';
import { getTransactionPadding, hp, wp } from 'src/common/data/responsiveness/responsive';

import AdvnaceOptions from 'src/assets/images/svgs/Advancedoptions.svg';
import BackIcon from 'src/assets/icons/back.svg';
import Buttons from 'src/components/Buttons';
import { CKTapCard } from 'cktap-protocol-react-native';
import Change from 'src/assets/images/svgs/change.svg';
import Edit from 'src/assets/images/svgs/edit.svg';
import EditDescriptionModal from 'src/components/HealthCheck/EditDescriptionModal';
import HealthCheck from 'src/assets/images/svgs/heathcheck.svg';
import Illustration from 'src/assets/images/illustration.svg';
import LinearGradient from 'react-native-linear-gradient';
import { LocalizationContext } from 'src/common/content/LocContext';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import NFC from 'src/core/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import { RFValue } from 'react-native-responsive-fontsize';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import RightArrowIcon from 'src/assets/icons/Wallets/icon_arrow.svg';
import { ScrollView } from 'react-native-gesture-handler';
import SettingUpTapsigner from 'src/components/SettingUpTapsigner';
import Settings from 'src/assets/images/svgs/settings.svg';
import SigningDeviceChecklist from './SigningDeviceChecklist';
import StatusBarComponent from 'src/components/StatusBarComponent';
import SuccessModal from 'src/components/HealthCheck/SuccessModal';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { WalletMap } from './WalletMap';
import WalletUtilities from 'src/core/wallets/operations/utils';
import _ from 'lodash';
import config from 'src/core/config';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import idx from 'idx';
import moment from 'moment';
import { useDispatch } from 'react-redux';

const Header = () => {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const common = translations['common'];
  return (
    <Box flexDirection={'row'} justifyContent={'space-between'} px={'5%'}>
      <StatusBar barStyle={'light-content'} />
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <BackIcon />
      </TouchableOpacity>
      <TouchableOpacity style={styles.knowMore}>
        <Text color={'light.lightBlack'} fontSize={12} letterSpacing={0.84} fontWeight={100}>
          {common.learnMore}
        </Text>
      </TouchableOpacity>
    </Box>
  );
};

const SigningDeviceDetails = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const vault = translations['vault'];
  const healthcheck = translations['healthcheck'];
  const tapsigner = translations['tapsigner'];
  const coldcard = translations['coldcard'];
  const { SignerIcon, signer, vaultId } = route.params;
  const [editDescriptionModal, setEditDescriptionModal] = useState(false);
  const [confirmHealthCheckModal, setconfirmHealthCheckModal] = useState(false);
  const [healthCheckViewTapSigner, setHealthCheckViewTapsigner] = useState(false);
  const [healthCheckViewColdCard, setHealthCheckViewColdCard] = useState(false);

  const [healthCheckSkipModal, setHealthCheckSkipModal] = useState(false);
  const [healthCheckSuccess, setHealthCheckSuccess] = useState(false);
  const [nfcVisible, setNfcVisible] = React.useState(false);
  const [description, setDescription] = useState('');
  const [cvc, setCvc] = useState('');
  const card = React.useRef(new CKTapCard()).current;
  const modalHandler = (callback) => {
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

  const scanMK4 = async () => {
    setNfcVisible(true);
    try {
      const { data, rtdName } = (await NFC.read(NfcTech.NfcV))[0];
      const xpub = rtdName === 'URI' ? data : rtdName === 'TEXT' ? data : data.p2sh_p2wsh;
      const path = data?.p2sh_p2wsh_deriv ?? '';
      const xfp = data?.xfp ?? '';
      setNfcVisible(false);
      return { xpub, path, xfp };
    } catch (err) {
      console.log(err);
      setNfcVisible(false);
    }
  };

  const getColdCardDetails = async () => {
    const { xpub, path: derivationPath, xfp } = await scanMK4();
    return { xpub, derivationPath, xfp };
  };

  const healthCheckTapSigner = React.useCallback(() => {
    modalHandler(async () => {
      await card.first_look();
      const isLegit = await card.certificate_check();
      if (isLegit) {
        const xpub = await card.get_xpub(cvc);
        return { xpub };
      }
    })()
      .then((resp) => {
        const { xpub } = resp;
        const networkType = config.NETWORK_TYPE;
        const network = WalletUtilities.getNetworkByType(networkType);
        const signerIdDerived = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
        if (signerIdDerived === signer.signerId) {
          dispatch(healthCheckSigner(vaultId, signer.signerId));
          setHealthCheckSuccess(true);
        } else {
          Alert.alert('verifivation failed');
        }
      })
      .catch(console.log);
  }, [cvc]);

  const healthCheckColdCard = React.useCallback(async () => {
    try {
      const colcard = await getColdCardDetails();
      let { xpub } = colcard;
      const networkType = config.NETWORK_TYPE;
      const network = WalletUtilities.getNetworkByType(networkType);
      xpub = WalletUtilities.generateXpubFromYpub(xpub, network);
      const signerIdDerived = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
      if (signerIdDerived === signer.signerId) {
        console.log('verified');
        dispatch(healthCheckSigner(vaultId, signer.signerId));
        setHealthCheckSuccess(true);
      } else {
        Alert.alert('verifivation failed');
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const closeHealthCheckSuccessView = () => setHealthCheckSuccess(false);

  const closeEditDescription = () => {
    setEditDescriptionModal(false);
  };

  const closeHealthCheckView = () => setHealthCheckViewTapsigner(false);

  const healthCheckSkip = () => {
    setHealthCheckViewTapsigner(false);
    setHealthCheckSkipModal(true);
  };

  const closehealthCheckSkip = () => {
    setHealthCheckSkipModal(false);
  };

  const SkipHealthCheck = () => {
    dispatch(healthCheckSigner(vaultId, signer.signerId));
    setHealthCheckSkipModal(false);
    navigation.goBack();
  };

  const onPress = () => {
    setEditDescriptionModal(false);
  };

  const onPressCVV = () => {
    healthCheckTapSigner();
    setconfirmHealthCheckModal(false);
  };

  const confirm = (signerType) => {
    switch (signerType) {
      case SignerType.TAPSIGNER:
        setHealthCheckViewTapsigner(false);
        setconfirmHealthCheckModal(true);
        break;
      case SignerType.COLDCARD:
        setHealthCheckViewColdCard(false);
        healthCheckColdCard();
        break;
    }
  };

  const confirmHealthCheck = () => {
    navigation.goBack();
  };

  const HealthCheckContentTapsigner = () => {
    return (
      <View>
        <Box alignSelf={'center'}>
          <TapsignerSetupImage />
        </Box>
        <Text
          color={'light.lightBlack2'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={2}
        >
          {'Health Check is initiated if a Signning Device is not used for the last 180 days'}
        </Text>
        <Text
          color={'light.lightBlack2'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={2}
        >
          {'You will need the Pin/ CVC at the back of the card'}
        </Text>
      </View>
    );
  };

  const HealthCheckContentColdCard = () => {
    return (
      <View>
        <Box alignSelf={'center'}>{/* <TapsignerSetupImage /> */}</Box>
        <Text
          color={'light.lightBlack2'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={2}
        >
          {'Health Check is initiated if a Signning Device is not used for the last 180 days'}
        </Text>
        <Text
          color={'light.lightBlack2'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={2}
        >
          {''}
        </Text>
      </View>
    );
  };

  const HealthCheckSkipContent = () => {
    return (
      <View>
        <Box alignSelf={'center'}>{/* <SuccessIcon /> */}</Box>
        <Text
          color={'light.lightBlack2'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={2}
        >
          {
            'You can choose to manually confirm the health of the Signing Device if you are sure that they are secure and accessible.'
          }
        </Text>
        <Text
          color={'light.lightBlack2'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={2}
        >
          {'Or you can choose to do the Health Check when you can'}
        </Text>
      </View>
    );
  };

  const HealthCheckSuccessContent = () => {
    return (
      <View>
        <Box alignSelf={'center'}>
          {' '}
          <Illustration />
        </Box>
        <Text
          color={'light.lightBlack2'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={2}
        >
          {
            'You will be reminded in 90 days Lorem ipsum dolor sit amet, consectetur adipiscing elit,'
          }
        </Text>
      </View>
    );
  };

  const openHealthCheckModal = (signerType) => {
    switch (signerType) {
      case SignerType.TAPSIGNER:
        setHealthCheckViewTapsigner(true);
        break;
      case SignerType.COLDCARD:
        setHealthCheckViewColdCard(true);
        break;
      default:
        Alert.alert('Health check for this device is not supported currently');
    }
  };

  const navigateToPolicyChange = (signer: VaultSigner) => {
    const restrictions = idx(signer, (_) => _.signerPolicy.restrictions);
    const exceptions = idx(signer, (_) => _.signerPolicy.exceptions);
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ChoosePolicyNew',
        params: {
          restrictions,
          exceptions,
          update: true,
          signer,
        },
      })
    );
  };

  const FooterItem = ({ Icon, title, onPress }) => {
    return (
      <TouchableOpacity onPress={onPress}>
        <VStack alignItems={'center'} style={{ marginTop: 10 }}>
          <Box
            margin={'1'}
            marginBottom={'3'}
            width={'12'}
            height={'12'}
            borderRadius={30}
            bg={'#FAC48B'}
            justifyContent={'center'}
            alignItems={'center'}
            alignSelf={'center'}
          >
            {<Icon />}
          </Box>
          <Text textAlign={'center'}>{title}</Text>
        </VStack>
      </TouchableOpacity>
    );
  };
  return (
    <Box style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <Header />
        <Box>
          <Box flexDirection={'row'} px={'10%'} py={'5%'}>
            <Box
              margin={'1'}
              marginBottom={'3'}
              width={'12'}
              height={'12'}
              borderRadius={30}
              bg={'#725436'}
              justifyContent={'center'}
              alignItems={'center'}
              alignSelf={'center'}
            >
              {WalletMap(signer.type, true).Icon}
            </Box>
            <Box marginTop={2} width={'75%'} flexDirection={'row'} justifyContent={'space-between'}>
              <Box flexDirection={'column'}>
                <Text fontSize={15}>{signer.signerName}</Text>
                <Text fontSize={13}>{`Added on ${moment(signer.addedOn)
                  .format('DD MMM YYYY, hh:mmA')
                  .toLowerCase()}`}</Text>
              </Box>
              <Box marginTop={3}>
                <TouchableOpacity
                  onPress={() => {
                    setEditDescriptionModal(true);
                  }}
                >
                  <Edit />
                </TouchableOpacity>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <ScrollView>
        <Box m={10}>
          <SigningDeviceChecklist date={signer.lastHealthCheck} />
        </Box>
      </ScrollView>
      <Box px={'10%'} py={'10%'}>
        <Text fontSize={13}>You will be reminded in 90 for the health check</Text>

        <HStack justifyContent={'space-between'}>
          <FooterItem
            Icon={Change}
            title={'Change Signer'}
            onPress={() => navigation.dispatch(CommonActions.navigate('AddSigningDevice'))}
          />
          <FooterItem
            Icon={HealthCheck}
            title={'Health Check'}
            onPress={() => {
              openHealthCheckModal(signer.type);
            }}
          />
          <FooterItem
            Icon={AdvnaceOptions}
            title={'Advance Options'}
            onPress={() => {
              if (signer.type === SignerType.POLICY_SERVER) navigateToPolicyChange(signer);
            }}
          />
        </HStack>
        <EditDescriptionModal
          visible={editDescriptionModal}
          closeHealthCheck={closeEditDescription}
          title={vault.EditDescription}
          subTitle={vault.Description}
          SignerName={signer.signerName}
          SignerDate={signer.lastHealthCheck}
          placeHolderName={'Add Description'}
          SignerIcon={SignerIcon}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'Proceed'}
          buttonTextColor={'light.white'}
          textColor={'light.lightBlack'}
          onPress={onPress}
          inputText={description}
          setInputText={setDescription}
        />
        <SuccessModal
          visible={healthCheckViewTapSigner}
          close={closeHealthCheckView}
          title={healthcheck.HealthCheck}
          subTitle={tapsigner.SetupDescription}
          buttonText={'Proceed'}
          buttonTextColor={'light.white'}
          cancelButtonText={'Skip'}
          cancelButtonColor={'light.greenText'}
          cancelButtonPressed={healthCheckSkip}
          buttonPressed={() => confirm(SignerType.TAPSIGNER)}
          Content={HealthCheckContentTapsigner}
        />
        <SuccessModal
          visible={healthCheckViewColdCard}
          close={closeHealthCheckView}
          title={healthcheck.HealthCheck}
          subTitle={coldcard.SetupDescription}
          buttonText={'Proceed'}
          buttonTextColor={'light.white'}
          cancelButtonText={'Skip'}
          cancelButtonColor={'light.greenText'}
          cancelButtonPressed={healthCheckSkip}
          buttonPressed={() => confirm(SignerType.COLDCARD)}
          Content={HealthCheckContentColdCard}
        />
        <SuccessModal
          visible={healthCheckSkipModal}
          close={closehealthCheckSkip}
          title={healthcheck.SkippingHealthCheck}
          subTitle={
            'It is very important that you keep your Signing Devices secure and fairly accessible at all times.'
          }
          buttonText={'Manual Confirm'}
          buttonTextColor={'light.white'}
          cancelButtonText={'Will Do Later'}
          cancelButtonColor={'light.greenText'}
          cancelButtonPressed={SkipHealthCheck}
          buttonPressed={confirm}
          Content={HealthCheckSkipContent}
        />
        <ModalWrapper
          visible={confirmHealthCheckModal}
          onSwipeComplete={() => setconfirmHealthCheckModal(false)}
        >
          <SettingUpTapsigner
            closeBottomSheet={() => {
              setconfirmHealthCheckModal(false);
              setCvc('');
            }}
            buttonText={'Proceed'}
            onPress={onPressCVV}
            inputText={cvc}
            setInputText={setCvc}
          />
        </ModalWrapper>
        <SuccessModal
          visible={healthCheckSuccess}
          close={closeHealthCheckSuccessView}
          title={healthcheck.HealthCheckSuccessful}
          subTitle={
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'
          }
          buttonText={'Home'}
          buttonTextColor={'light.white'}
          cancelButtonText={''}
          cancelButtonColor={'light.greenText'}
          cancelButtonPressed={SkipHealthCheck}
          buttonPressed={confirmHealthCheck}
          Content={HealthCheckSuccessContent}
        />
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    position: 'relative',
  },
  knowMore: {
    backgroundColor: 'light.brownborder',
    paddingHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'light.lightBlack',
  },
  buttonContainer: {
    height: 50,
    width: 120,
    borderRadius: 10,
  },
});
export default SigningDeviceDetails;
