import { Alert, Platform, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, HStack, VStack, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';

import AdvnaceOptions from 'src/assets/images/svgs/Advancedoptions.svg';
import { CKTapCard } from 'cktap-protocol-react-native';
import Change from 'src/assets/images/svgs/change.svg';
import HealthCheck from 'src/assets/images/svgs/heathcheck.svg';
import Illustration from 'src/assets/images/illustration.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import NFC from 'src/core/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import SettingUpTapsigner from 'src/components/SettingUpTapsigner';
import { SignerType } from 'src/core/wallets/enums';
import SuccessModal from 'src/components/HealthCheck/SuccessModal';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import HeaderTitle from 'src/components/HeaderTitle';
import { getSignerNameFromType } from 'src/hardware';
import { WalletMap } from './WalletMap';
import SigningDeviceChecklist from './SigningDeviceChecklist';

function SigningDeviceDetails({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { vault } = translations;
  const { healthcheck } = translations;
  const { tapsigner } = translations;
  const { coldcard } = translations;
  const { signer, vaultId } = route.params;
  const [confirmHealthCheckModal, setconfirmHealthCheckModal] = useState(false);
  const [healthCheckViewTapSigner, setHealthCheckViewTapsigner] = useState(false);
  const [healthCheckViewColdCard, setHealthCheckViewColdCard] = useState(false);

  const [healthCheckSkipModal, setHealthCheckSkipModal] = useState(false);
  const [healthCheckSuccess, setHealthCheckSuccess] = useState(false);
  const [nfcVisible, setNfcVisible] = React.useState(false);
  const [description, setDescription] = useState('');
  const [cvc, setCvc] = useState('');
  const card = React.useRef(new CKTapCard()).current;
  const modalHandler = (callback) =>
    Platform.select({
      android: async () => {
        setNfcVisible(true);
        const resp = await card.nfcWrapper(callback);
        setNfcVisible(false);
        return resp;
      },
      ios: async () => card.nfcWrapper(callback),
    });

  const scanMK4 = async () => {
    setNfcVisible(true);
    try {
      const { data, rtdName } = (await NFC.read(NfcTech.NfcV))[0];
      const xpub = rtdName === 'URI' ? data : rtdName === 'TEXT' ? data : data.p2wsh;
      const path = data?.p2wsh_deriv ?? '';
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

  function HealthCheckContentTapsigner() {
    return (
      <View>
        <Box alignSelf="center">
          <TapsignerSetupImage />
        </Box>
        <Text color="light.secondaryText" fontSize={13} fontFamily="body" fontWeight="200" p={2}>
          Health Check is initiated if a signning device is not used for the last 180 days
        </Text>
        <Text color="light.secondaryText" fontSize={13} fontFamily="body" fontWeight="200" p={2}>
          You will need the Pin/ CVC at the back of the card
        </Text>
      </View>
    );
  }

  function HealthCheckContentColdCard() {
    return (
      <View>
        <Box alignSelf="center">{/* <TapsignerSetupImage /> */}</Box>
        <Text color="light.secondaryText" fontSize={13} fontFamily="body" fontWeight="200" p={2}>
          Health Check is initiated if a signning device is not used for the last 180 days
        </Text>
        <Text color="light.secondaryText" fontSize={13} fontFamily="body" fontWeight="200" p={2} />
      </View>
    );
  }

  function HealthCheckSkipContent() {
    return (
      <View>
        <Box alignSelf="center">{/* <SuccessIcon /> */}</Box>
        <Text color="light.secondaryText" fontSize={13} fontFamily="body" fontWeight="200" p={2}>
          You can choose to manually confirm the health of the signing device if you are sure that
          they are secure and accessible.
        </Text>
        <Text color="light.secondaryText" fontSize={13} fontFamily="body" fontWeight="200" p={2}>
          Or you can choose to do the Health Check when you can
        </Text>
      </View>
    );
  }

  function HealthCheckSuccessContent() {
    return (
      <View>
        <Box alignSelf="center">
          {' '}
          <Illustration />
        </Box>
        <Text color="light.secondaryText" fontSize={13} fontFamily="body" fontWeight="200" p={2}>
          You will be reminded in 90 days for the health check
        </Text>
      </View>
    );
  }

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

  function FooterItem({ Icon, title, onPress }) {
    return (
      <TouchableOpacity onPress={onPress}>
        <VStack alignItems="center" style={{ marginTop: 10 }}>
          <Box
            margin="1"
            marginBottom="3"
            width="12"
            height="12"
            borderRadius={30}
            bg="light.lightAccent"
            justifyContent="center"
            alignItems="center"
          >
            <Icon />
          </Box>
          <Text
            numberOfLines={2}
            fontSize={12}
            letterSpacing={0.84}
            width={wp(100)}
            textAlign="center"
          >
            {title}
          </Text>
        </VStack>
      </TouchableOpacity>
    );
  }
  return (
    <ScreenWrapper>
      <HeaderTitle learnMore />
      <Box
        style={{
          flexDirection: 'row',
          paddingHorizontal: '3%',
        }}
      >
        <Box
          style={{
            margin: 5,
            justifyContent: 'center',
            alignItems: 'center',
            width: hp(48),
            height: hp(48),
            borderRadius: 30,
            backgroundColor: '#725436',
          }}
        >
          {WalletMap(signer.type, true).Icon}
        </Box>
        <Box marginTop={2} width="75%" flexDirection="row" justifyContent="space-between">
          <Box flexDirection="column">
            <Text fontSize={14} letterSpacing={1.15}>
              {getSignerNameFromType(
                signer.type,
                signer.isMock,
                signer.amfData && signer.amfData.xpub
              )}
            </Text>
            <Text fontSize={13} color="light.greenText">{`Added on ${moment(signer.addedOn)
              .format('DD MMM YYYY, hh:mmA')
              .toLowerCase()}`}</Text>
          </Box>
        </Box>
      </Box>

      <ScrollView>
        <Box mx={5} mt={4}>
          <SigningDeviceChecklist date={signer.lastHealthCheck} />
        </Box>
      </ScrollView>

      <Box
        position="absolute"
        bottom={0}
        alignItems="center"
        justifyContent="center"
        width={windowWidth}
        height={hp(188)}
        backgroundColor="light.ReceiveBackground"
      >
        <Text fontSize={13} color="light.greenText" letterSpacing={0.65}>
          You will be reminded in 90 days for the health check
        </Text>
        <Box
          borderColor="light.GreyText"
          style={{
            borderWidth: 0.5,
            width: '90%',
            borderRadius: 20,
            opacity: 0.2,
            marginVertical: hp(15),
          }}
        />

        <HStack justifyContent="space-between">
          <FooterItem
            Icon={Change}
            title="Change signing device"
            onPress={() => navigation.dispatch(CommonActions.navigate('AddSigningDevice'))}
          />
          <FooterItem
            Icon={HealthCheck}
            title="Health Check"
            onPress={() => {
              openHealthCheckModal(signer.type);
            }}
          />
          <FooterItem
            Icon={AdvnaceOptions}
            title="Advance Options"
            onPress={() => {
              navigation.dispatch(CommonActions.navigate('SignerAdvanceSettings', { signer }));
            }}
          />
        </HStack>
        <SuccessModal
          visible={healthCheckViewTapSigner}
          close={closeHealthCheckView}
          title={healthcheck.HealthCheck}
          subTitle={tapsigner.SetupDescription}
          buttonText="Proceed"
          buttonTextColor="light.white"
          cancelButtonText="Skip"
          cancelButtonColor="light.greenText"
          cancelButtonPressed={healthCheckSkip}
          buttonPressed={() => confirm(SignerType.TAPSIGNER)}
          Content={HealthCheckContentTapsigner}
        />
        <SuccessModal
          visible={healthCheckViewColdCard}
          close={closeHealthCheckView}
          title={healthcheck.HealthCheck}
          subTitle={coldcard.SetupDescription}
          buttonText="Proceed"
          buttonTextColor="light.white"
          cancelButtonText="Skip"
          cancelButtonColor="light.greenText"
          cancelButtonPressed={healthCheckSkip}
          buttonPressed={() => confirm(SignerType.COLDCARD)}
          Content={HealthCheckContentColdCard}
        />
        <SuccessModal
          visible={healthCheckSkipModal}
          close={closehealthCheckSkip}
          title={healthcheck.SkippingHealthCheck}
          subTitle="It is very important that you keep your signing devices secure and fairly accessible at all times."
          buttonText="Manual Confirm"
          buttonTextColor="light.white"
          cancelButtonText="Will Do Later"
          cancelButtonColor="light.greenText"
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
            buttonText="Proceed"
            onPress={onPressCVV}
            inputText={cvc}
            setInputText={setCvc}
          />
        </ModalWrapper>
        <SuccessModal
          visible={healthCheckSuccess}
          close={closeHealthCheckSuccessView}
          title={healthcheck.HealthCheckSuccessful}
          subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
          buttonText="Home"
          buttonTextColor="light.white"
          cancelButtonText=""
          cancelButtonColor="light.greenText"
          cancelButtonPressed={SkipHealthCheck}
          buttonPressed={confirmHealthCheck}
          Content={HealthCheckSuccessContent}
        />
      </Box>
    </ScreenWrapper>
  );
}

export default SigningDeviceDetails;
