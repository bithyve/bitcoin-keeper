import React, { useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import moment from 'moment';
// Components, Hooks, functions etc
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import HeaderTitle from 'src/components/HeaderTitle';
import { getSignerNameFromType, isSignerAMF } from 'src/hardware';
import useToastMessage from 'src/hooks/useToastMessage';
import KeeperModal from 'src/components/KeeperModal';
import SeedSigner from 'src/assets/images/seedsigner_setup.svg';
import Ledger from 'src/assets/images/ledger_image.svg';
import Keystone from 'src/assets/images/keystone_illustration.svg';
import PassportSVG from 'src/assets/images/illustration_passport.svg';
import AdvnaceOptions from 'src/assets/images/Advancedoptions.svg';
import Change from 'src/assets/images/change.svg';
import HealthCheck from 'src/assets/images/heathcheck.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import MobileKeyIllustration from 'src/assets/images/mobileKey_illustration.svg';
import SeedWordsIllustration from 'src/assets/images/illustration_seed_words.svg';
import KeeperSetupImage from 'src/assets/images/illustration_ksd.svg';
import SigningServerIllustration from 'src/assets/images/signingServer_illustration.svg';
import BitboxImage from 'src/assets/images/bitboxSetup.svg';
import TrezorSetup from 'src/assets/images/trezor_setup.svg';
import JadeSVG from 'src/assets/images/illustration_jade.svg';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import SigningDeviceChecklist from './SigningDeviceChecklist';
import { SDIcons } from './SigningDeviceIcons';
import { SignerType } from 'src/core/wallets/enums';
import HardwareModalMap, { ModalTypes } from './HardwareModalMap';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';

function SigningDeviceDetails({ route }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { signerId = null } = route.params;
  const [detailModal, setDetailModal] = useState(false);
  const [skipHealthCheckModalVisible, setSkipHealthCheckModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const { useQuery } = useContext(RealmWrapperContext);
  const { showToast } = useToastMessage();
  const activeVault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const signer: VaultSigner = activeVault.signers.filter(
    (signer) => signer?.signerId === signerId
  )[0];
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
      case SignerType.MOBILE_KEY:
        return {
          title: 'Mobile Key',
          subTitle: 'You could use the wallet key on your app as one of the signing keys',
          assert: <MobileKeyIllustration />,
          description:
            '\u2022To back up the Mobile Key, ensure the Wallet Seed (12 words) is backed up.\n\u2022 You will find this in the settings menu from the top left of the Home Screen.\n\u2022 These keys are considered as hot because they are on your connected device.',
          FAQ: '',
        };
      case SignerType.SEED_WORDS:
        return {
          title: 'Seed Key',
          subTitle: 'You could use a newly generated seed (12 words) as one of the signing keys',
          assert: <SeedWordsIllustration />,
          description:
            '\u2022Keep these safe by writing them down on a piece of paper or on a metal plate.\n\u2022 When you use them to sign a transaction, you will have to provide these in the same order.\n\u2022 These keys are considered warm because you may have to get them online when signing a transaction.',
          FAQ: '',
        };
      case SignerType.KEEPER:
        return {
          title: 'Keeper as signing device',
          subTitle: 'You can use a specific BIP-85 wallet on another Keeper app as a signer',
          assert: <KeeperSetupImage />,
          description:
            '\u2022Make sure that the other Keeper app is backed up using the 12-word Recovery Phrase.\n\u2022 When you want to sign a transaction using this option, you will have to navigate to the specific wallet used',
          FAQ: '',
        };
      case SignerType.POLICY_SERVER:
        return {
          title: 'Signing Server',
          subTitle:
            'The key on the Signing Server will sign a transaction depending on the policy and authentication',
          assert: <SigningServerIllustration />,
          description:
            '\u2022An auth app provides the 6-digit authentication code.\n\u2022 When restoring the app using signing devices, you will need to provide this code. \n\u2022 Considered a hot key as it is on a connected online server',
          FAQ: '',
        };
      case SignerType.BITBOX02:
        return {
          title: 'Bitbox 02',
          subTitle: 'Easy backup and restore with a microSD card',
          assert: <BitboxImage />,
          description:
            'Minimalist and discreet design. The BitBox02 features a dual-chip design with a secure chip Limited firmware that only supports Bitcoin',
          FAQ: 'https://shiftcrypto.ch/support/',
        };
      case SignerType.TREZOR:
        return {
          title: 'Trezor',
          subTitle:
            'Trezor Suite is designed for every level of user. Easily and securely send, receive, and manage coins with confidence',
          assert: <TrezorSetup />,
          description:
            '\u2022Sleek, secure design.\n\u2022 Digital Independence.\n\u2022 Easy hardware wallet backup',
          FAQ: 'https://trezor.io/support',
        };
      case SignerType.JADE:
        return {
          title: 'Jade Blockstream',
          subTitle:
            'Jade is an easy-to-use, purely open-source hardware wallet that offers advanced security for your Bitcoin.',
          assert: <JadeSVG />,
          description:
            '\u2022World-class security.\n\u2022 Manage your assets from mobile or desktop.\n\u2022 Camera for fully air-gapped transactions',
          FAQ: 'https://help.blockstream.com/hc/en-us/categories/900000061906-Blockstream-Jade',
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

  const HealthCheckContentTapsigner = () => {
    return (
      <Box>
        <Text>
          You can choose to manually confirm the health of the Signing Device if you are sure that
          they are secure and accessible. Or you can choose to do the Health Check when you can
        </Text>
      </Box>
    );
  };

  function FooterItem({ Icon, title, onPress }) {
    return (
      <TouchableOpacity style={{ width: wp(100) }} onPress={onPress}>
        <Box
          style={{
            alignItems: 'center',
          }}
        >
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
          <Text numberOfLines={2} fontSize={12} letterSpacing={0.84} textAlign="center">
            {title}
          </Text>
        </Box>
      </TouchableOpacity>
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
            borderWidth: 1,
            backgroundColor: '#725436',
          }}
        >
          {SDIcons(signer?.type, true).Icon}
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

        <Box
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <FooterItem
            Icon={Change}
            title="Change signing device"
            onPress={() => navigation.dispatch(CommonActions.navigate('AddSigningDevice'))}
          />
          <FooterItem
            Icon={HealthCheck}
            title="Health Check"
            onPress={() => {
              setVisible(true);
              // openHealthCheckModal(signer?.type);
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
        <HardwareModalMap
          type={signer?.type}
          visible={visible}
          close={() => setVisible(false)}
          modalType={ModalTypes.HEALTH_CHECK}
          signer={signer}
          skipHealthCheckCallBack={() => {
            setVisible(false);
            setSkipHealthCheckModalVisible(true);
          }}
        />

        <KeeperModal
          visible={skipHealthCheckModalVisible}
          close={() => setSkipHealthCheckModalVisible(false)}
          title={'Skipping Health Check'}
          subTitle={
            'It is very important that you keep your Signing Devices secure and fairly accessible at all times.'
          }
          buttonText="Do Later"
          secondaryButtonText="Confirm Access"
          buttonTextColor="light.white"
          buttonCallback={() => setSkipHealthCheckModalVisible(false)}
          secondaryCallback={() => {
            dispatch(healthCheckSigner([signer]));
            showToast('Device verified manually!');
            setSkipHealthCheckModalVisible(false);
          }}
          textColor="light.primaryText"
          Content={HealthCheckContentTapsigner}
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
