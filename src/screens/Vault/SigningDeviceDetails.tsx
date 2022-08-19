import { Box, HStack, Text, VStack, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  FlatList,
  InteractionManager,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import config, { APP_STAGE } from 'src/core/config';
import { getTransactionPadding, hp, wp } from 'src/common/data/responsiveness/responsive';
import config, { APP_STAGE } from 'src/core/config';
import BackIcon from 'src/assets/icons/back.svg';
import { CKTapCard } from 'cktap-protocol-react-native';
import Edit from 'src/assets/images/svgs/edit.svg';
import EditDescriptionModal from 'src/components/XPub/EditDescriptionModal';
import HealthCheckModal from 'src/components/HealthCheckModal';
import Illustration from 'src/assets/images/illustration.svg';
import LinearGradient from 'react-native-linear-gradient';
import { LocalizationContext } from 'src/common/content/LocContext';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import { NetworkType } from 'src/core/wallets/enums';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import StatusBarComponent from 'src/components/StatusBarComponent';
import SigningDeviceChecklist from './SigningDeviceChecklist';

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
  const { useQuery } = useContext(RealmWrapperContext);
  const { translations } = useContext(LocalizationContext);
  const vault = translations['vault'];
  const healthcheck = translations['healthcheck'];
  const tapsigner = translations['tapsigner'];
  const { SignerIcon, signer, vaultId } = route.params;
  const [editDescriptionModal, setEditDescriptionModal] = useState(false);
  const [confirmHealthCheckModal, setconfirmHealthCheckModal] = useState(false);
  const [healthCheckView, setHealthCheckView] = useState(false);
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
        console.log(xpub);
        const networkType =
          config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET;
        const network = WalletUtilities.getNetworkByType(networkType);
        const signerIdDerived = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
        if (signerIdDerived === signer.signerId) {
          console.log('verified');
          dispatch(healthCheckSigner(vaultId, signer.signerId));
          setHealthCheckSuccess(true);
        } else {
          console.log('verifivation failed');
        }
      })
      .catch(console.log);
  }, [cvc]);

  const closeHealthCheckSuccessView = () => setHealthCheckSuccess(false);

  const closeEditDescription = () => {
    setEditDescriptionModal(false);
  };

  const closeCVVModal = () => {
    setconfirmHealthCheckModal(false);
  };

  const closeHealthCheckView = () => setHealthCheckView(false);

  const healthCheckSkip = () => {
    setHealthCheckView(false);
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

  const confirm = () => {
    setHealthCheckView(false);
    setconfirmHealthCheckModal(true);
  };

  const confirmHealthCheck = () => {
    navigation.goBack();
  };

  const HealthCheckContent = () => {
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
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
        </Text>
        <Text
          color={'light.lightBlack2'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={2}
        >
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
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
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
        </Text>
        <Text
          color={'light.lightBlack2'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={2}
        >
          {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
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

  return (
    <Box style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <Header />
        <Box>
          <Box flexDirection={'row'} px={'10%'} py={'5%'}>
            {SignerIcon}
            <Box marginTop={2} width={'75%'} flexDirection={'row'} justifyContent={'space-between'}>
              <Box flexDirection={'column'}>
                <Text fontSize={15}>{signer.signerName}</Text>
                <Text fontSize={13}>Lorem ipsum dolor</Text>
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
          <SigningDeviceChecklist />
        </Box>
      </ScrollView>
      <Box px={'10%'} py={'10%'}>
        <Text fontSize={13}>
          You will be reminded in 90 days Lorem ipsum dolor sit amet, consectetur adipiscing elit,
        </Text>
        <Box marginTop={10} flexDirection={'row'} justifyContent={'space-between'}>
          <Text
            marginTop={3}
            color={'light.greenText'}
            letterSpacing={0.8}
            fontWeight={300}
            fontSize={14}
          >
            {healthcheck.ChangeSigningDevice}
          </Text>
          <LinearGradient
            colors={['#00836A', '#073E39']}
            style={styles.buttonContainer}
            start={{ x: -0.5, y: 1 }}
            end={{ x: 1, y: 1 }}
          >
            <Text
              justifyContent={'center'}
              color={'white'}
              textAlign={'center'}
              letterSpacing={0.8}
              fontWeight={300}
              fontSize={14}
              marginTop={3}
              onPress={() => {
                setHealthCheckView(true);
              }}
            >
              {healthcheck.HealthCheck}
            </Text>
          </LinearGradient>
        </Box>
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
