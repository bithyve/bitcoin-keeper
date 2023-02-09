import React, { useContext, useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, HStack, VStack, View, Center } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { NfcTech } from 'react-native-nfc-manager';
import moment from 'moment';
// Components, Hooks, functions etc
import Text from 'src/components/KeeperText';
import { CKTapCard } from 'cktap-protocol-react-native';
import { LocalizationContext } from 'src/common/content/LocContext';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import NFC from 'src/core/services/nfc';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import SettingUpTapsigner from 'src/components/SettingUpTapsigner';
import { SignerType } from 'src/core/wallets/enums';
import SuccessModal from 'src/components/HealthCheck/SuccessModal';
import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import HeaderTitle from 'src/components/HeaderTitle';
import { getSignerNameFromType, isSignerAMF } from 'src/hardware';
import useToastMessage from 'src/hooks/useToastMessage';
import KeeperModal from 'src/components/KeeperModal';
import SkipHealthCheckIcon from 'src/assets/images/skipHealthCheck.svg';
import SeedSigner from 'src/assets/images/seedsigner_setup.svg';
import Ledger from 'src/assets/images/ledger_image.svg';
import Keystone from 'src/assets/images/keystone_illustration.svg';
import PassportSVG from 'src/assets/images/illustration_passport.svg';
import AdvnaceOptions from 'src/assets/images/Advancedoptions.svg';
import Change from 'src/assets/images/change.svg';
import HealthCheck from 'src/assets/images/heathcheck.svg';
import Illustration from 'src/assets/images/illustration.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import ToastError from 'src/assets/images/toast_error.svg';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';

import openLink from 'src/utils/OpenLink';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import SigningDeviceChecklist from './SigningDeviceChecklist';
import { WalletMap } from './WalletMap';

function SigningDeviceDetails({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { vault } = translations;
  const { healthcheck } = translations;
  const { tapsigner } = translations;
  const { coldcard } = translations;
  const { signerId = null, vaultId } = route.params;
  const [confirmHealthCheckModal, setconfirmHealthCheckModal] = useState(false);
  const [healthCheckViewTapSigner, setHealthCheckViewTapsigner] = useState(false);
  const [healthCheckViewColdCard, setHealthCheckViewColdCard] = useState(false);

  const [healthCheckSkipModal, setHealthCheckSkipModal] = useState(false);
  const [healthCheckSuccess, setHealthCheckSuccess] = useState(false);
  const [nfcVisible, setNfcVisible] = React.useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [cvc, setCvc] = useState('');
  const card = React.useRef(new CKTapCard()).current;
  const { useQuery } = useContext(RealmWrapperContext);
  const activeVault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const signer = activeVault.signers.filter((signer) => signer?.signerId === signerId)[0];
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

  const getSignerContent = (type: SignerType) => {
    switch (type) {
      case SignerType.COLDCARD:
        return {
          title: 'Coldcard',
          subTitle:
            'Coldcard is an easy-to-use, ultra-secure, open-source, and affordable hardware wallet that is easy to back up via an encrypted microSD card. Your private key is stored in a dedicated security chip. MicroPython software design allows you to make changes',
          assert: <ColdCardSetupImage />,
          description:
            '\u2022 It provides the best Physical Security.\n\u2022 All of the Coldcard is viewable, editable, and verifiable. You can compile it yourself.\n\u2022 Only signing device (hardware wallet) with the option to avoid ever being connected to a computer.',
          FAQ: 'https://coldcard.com/docs/faq',
        };
      case SignerType.TAPSIGNER:
        return {
          title: 'TAPSIGNER',
          subTitle:
            "TAPSIGNER's lower cost makes hardware wallet features and security available to a wider market around the world.",
          assert: <TapsignerSetupImage />,
          description:
            '\u2022 An NFC card provides fast and easy user experiences.\n\u2022 TAPSIGNER is a great way to keep your keys separate from your wallet(s).\n\u2022 The card form factor makes it easy to carry and easy to conceal.',
          FAQ: 'https://tapsigner.com/faq',
        };
      case SignerType.LEDGER:
        return {
          title: 'LEDGER',
          subTitle:
            'Ledger has industry-leading security to keep your Bitcoin secure at all times. Buy, sell, exchange, and grow your assets with our partners easily and securely. With Ledger, you can secure, store and manage your Bitcoin.',
          assert: <Ledger />,
          description: '',
          FAQ: 'https://support.ledger.com/hc/en-us/categories/4404369571601?support=true',
        };
      case SignerType.SEEDSIGNER:
        return {
          title: 'SeedSigner',
          subTitle:
            'The goal of SeedSigner is to lower the cost and complexity of Bitcoin multi-signature wallet use. To accomplish this goal, SeedSigner offers anyone the opportunity to build a verifiably air-gapped, stateless Bitcoin signing device using inexpensive, publicly available hardware components (usually < $50). SeedSigner helps users save with Bitcoin by assisting with trustless private key generation and multi-signature wallet setup, and helps users transact with Bitcoin via a secure, air-gapped QR-exchange signing model.',
          assert: <SeedSigner />,
          description: '',
          FAQ: 'https://seedsigner.com/faqs/',
        };
      case SignerType.KEYSTONE:
        return {
          title: 'Keystone',
          subTitle:
            'It offers a convenient cold storage solution with open-source firmware, a 4-inch touchscreen, and PSBT Bitcoin multi-sig support. Protect your cryptocurrency with the perfect balance between a secure and convenient hardware wallet with mobile phone support.',
          assert: <Keystone />,
          description:
            '\u2022All hardware wallets need some means of connecting to the network to sign transactions; how “air-gapped” your hardware wallet depends on how it limits the attack surface when transmitting data to an internet-enabled device.\n\u2022 With QR codes, you can verify each and every data transmission to ensure that information coming into the Keystone Hardware Wallet contains no trojans or viruses and information going out doesn’t leak private keys or any other sensitive information.\n\u2022 Keystone Hardware Wallet uses a bank-grade Secure Element to generate true random numbers, derive private and public keys, sign transactions, and [protect private keys from being leaked if an attacker has physical access to the device.',
          FAQ: 'https://support.keyst.one/miscellaneous/faq',
        };
      case SignerType.PASSPORT:
        return {
          title: 'Foundation Passport',
          subTitle:
            'Foundation products empower individuals to reclaim their digital sovereignty by taking control of your money and data. Foundation offers best-in-class security and privacy via openness. No walled gardens; no closed source engineering',
          assert: <PassportSVG />,
          description:
            '\u2022Foundation products are beautiful, and intuitive, and remove the steep learning curve typically associated with Bitcoin and decentralized tech.\n\u2022 Foundation reflects our optimism about the future. Our products feel positive, aspirational, and a bit sci-fi.',
          FAQ: 'https://docs.foundationdevices.com',
        };
      default:
        return {
          title: '',
          subTitle: '',
          assert: null,
          description: '',
          FAQ: '',
        };
    }
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
        if (signerIdDerived === signer?.signerId) {
          dispatch(healthCheckSigner(vaultId, signer?.signerId));
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
      if (signerIdDerived === signer?.signerId) {
        console.log('verified');
        dispatch(healthCheckSigner(vaultId, signer?.signerId));
        setHealthCheckSuccess(true);
      } else {
        Alert.alert('verification failed');
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
    dispatch(healthCheckSigner(vaultId, signer?.signerId));
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
        <Text color="light.secondaryText" fontSize={13} padding={2}>
          Health Check is initiated if a signning device is not used for the last 180 days
        </Text>
        <Text color="light.secondaryText" fontSize={13} padding={2}>
          You will need the Pin/ CVC at the back of the card
        </Text>
      </View>
    );
  }

  function HealthCheckContentColdCard() {
    return (
      <View>
        <Box alignSelf="center">
          <ColdCardSetupImage />
        </Box>
        <Text color="light.secondaryText" style={styles.textStyle}>
          Health Check is initiated if a signning device is not used for the last 180 days
        </Text>
        <Text color="light.secondaryText" style={styles.textStyle} />
      </View>
    );
  }

  function HealthCheckSkipContent() {
    return (
      <View>
        <Box marginLeft={5}>
          <SkipHealthCheckIcon />
        </Box>
        <Text color="light.secondaryText" style={styles.textStyle}>
          You can choose to manually confirm the health of the signing device if you are sure that
          they are secure and accessible.
        </Text>
        <Text color="light.secondaryText" style={styles.textStyle}>
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
        <Text color="light.secondaryText" fontSize={13} padding={2}>
          You will be reminded in 90 days for the health check
        </Text>
      </View>
    );
  }

  const openHealthCheckModal = (signerType) => {
    switch (signerType) {
      default:
        showToast(
          'Health check coming soon!',
          <ToastError />,
          1000,
          false,
          '60%',
          <Text color="light.black" style={{ marginLeft: 10, width: '60%' }} numberOfLines={2}>
            Health check for this device is
            <Text
              color="light.black"
              style={{
                fontStyle: 'italic',
                fontWeight: '600',
              }}
            >
              {' coming soon!'}
            </Text>
          </Text>
        );
    }
  };

  function FooterItem({ Icon, title, onPress }) {
    return (
      <TouchableOpacity onPress={onPress}>
        <Box style={{
          alignItems: 'center'
        }}>
          <Box
            margin="1"
            marginBottom="3"
            width="12"
            height="12"
            borderRadius={30}
            backgroundColor="light.accent"
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
        </Box>
      </TouchableOpacity>
    );
  }

  function SignerContent() {
    return (
      <Box>
        <Center>{getSignerContent(signer?.type).assert}</Center>
        <Text
          color="light.white"
          style={{
            fontSize: 13,
            letterSpacing: 0.65,
            marginTop: hp(25),
          }}
        >
          {getSignerContent(signer?.type).description}
        </Text>
      </Box>
    );
  }
  return (
    <ScreenWrapper>
      <HeaderTitle
        learnMore
        learnMorePressed={() => setDetailModal(getSignerContent(signer?.type).title)}
      />
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
          {WalletMap(signer?.type, true).Icon}
        </Box>
        <Box marginTop={2} width="75%" flexDirection="row" justifyContent="space-between">
          <Box flexDirection="column">
            <Text fontSize={14} letterSpacing={1.15}>
              {getSignerNameFromType(signer?.type, signer?.isMock, isSignerAMF(signer))}
            </Text>
            <Text fontSize={13} color="light.greenText">{`Added on ${moment(signer?.addedOn)
              .format('DD MMM YYYY, hh:mmA')
              .toLowerCase()}`}</Text>
          </Box>
        </Box>
      </Box>

      <ScrollView>
        <Box mx={5} mt={4}>
          <SigningDeviceChecklist signer={signer} />
        </Box>
      </ScrollView>

      <Box
        position="absolute"
        bottom={0}
        alignItems="center"
        justifyContent="center"
        width={windowWidth}
        height={hp(188)}
        backgroundColor="light.secondaryBackground"
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

        <Box style={{
          justifyContent: 'space-between',
          flexDirection: 'row'
        }}>
          <FooterItem
            Icon={Change}
            title="Change signing device"
            onPress={() => navigation.dispatch(CommonActions.navigate('AddSigningDevice'))}
          />
          <FooterItem
            Icon={HealthCheck}
            title="Health Check"
            onPress={() => {
              openHealthCheckModal(signer?.type);
            }}
          />
          <FooterItem
            Icon={AdvnaceOptions}
            title="Advance Options"
            onPress={() => {
              navigation.dispatch(CommonActions.navigate('SignerAdvanceSettings', { signer }));
            }}
          />
        </Box>
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
          textColor="light.secondaryText"
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
        <KeeperModal
          visible={detailModal}
          close={() => setDetailModal(false)}
          title={getSignerContent(signer?.type).title}
          subTitle={getSignerContent(signer?.type).subTitle}
          modalBackground={['light.gradientStart', 'light.gradientEnd']}
          textColor="light.white"
          learnMoreCallback={() => openLink(getSignerContent(signer?.type).FAQ)}
          Content={SignerContent}
          DarkCloseIcon
          learnMore
        />
      </Box>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  textStyle: {
    fontSize: 13,
    paddingVertical: 2,
    left: -7,
  },
});

export default SigningDeviceDetails;
