import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Box, Center, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import { hp, wp } from 'src/constants/responsive';
import KeeperHeader from 'src/components/KeeperHeader';
import useToastMessage from 'src/hooks/useToastMessage';
import KeeperModal from 'src/components/KeeperModal';
import SeedSigner from 'src/assets/images/seedsigner_setup.svg';
import Ledger from 'src/assets/images/ledger_image.svg';
import Keystone from 'src/assets/images/keystone_illustration.svg';
import PassportSVG from 'src/assets/images/illustration_passport.svg';
import AdvnaceOptions from 'src/assets/images/settings.svg';
import Change from 'src/assets/images/change.svg';
import HealthCheck from 'src/assets/images/healthcheck_light.svg';
import SkipHealthCheck from 'src/assets/images/skipHealthCheck.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import MobileKeyIllustration from 'src/assets/images/mobileKey_illustration.svg';
import SeedWordsIllustration from 'src/assets/images/illustration_seed_words.svg';
import KeeperSetupImage from 'src/assets/images/illustration_ksd.svg';
import SigningServerIllustration from 'src/assets/images/signingServer_illustration.svg';
import BitboxImage from 'src/assets/images/bitboxSetup.svg';
import TrezorSetup from 'src/assets/images/trezor_setup.svg';
import JadeSVG from 'src/assets/images/illustration_jade.svg';
import InhertanceKeyIcon from 'src/assets/images/illustration_inheritanceKey.svg';
import { SignerType } from 'src/core/wallets/enums';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';
import useVault from 'src/hooks/useVault';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import KeeperFooter from 'src/components/KeeperFooter';
import openLink from 'src/utils/OpenLink';
import { KEEPER_KNOWLEDGEBASE } from 'src/core/config';
import SigningDeviceChecklist from './SigningDeviceChecklist';
import HardwareModalMap, { InteracationMode } from './HardwareModalMap';
import IdentifySignerModal from './components/IdentifySignerModal';
import { SDIcons } from './SigningDeviceIcons';
import moment from 'moment';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import useSignerMap from 'src/hooks/useSignerMap';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';

const getSignerContent = (type: SignerType) => {
  switch (type) {
    case SignerType.COLDCARD:
      return {
        title: 'Coldcard',
        subTitle:
          'Coldcard is an easy-to-use, ultra-secure, open-source, and affordable hardware wallet that is easy to back up via an encrypted microSD card. Your private key is stored in a dedicated security chip.',
        assert: <ColdCardSetupImage />,
        description:
          '\u2022 Coldcard provides the best Physical Security.\n\u2022 All of the Coldcard is viewable, editable, and verifiable. You can compile it yourself.\n\u2022 Only signer (hardware wallet) with the option to avoid ever being connected to a computer.',
        FAQ: 'https://coldcard.com/docs/faq',
      };
    case SignerType.TAPSIGNER:
      return {
        title: 'TAPSIGNER',
        subTitle:
          'TAPSIGNER is a Bitcoin private key on a card! You can sign mobile wallet transaction by tapping the phone',
        assert: <TapsignerSetupImage />,
        description:
          '\u2022 TAPSIGNER’s lower cost makes hardware wallet features and security available to a wider market around the world.\n\u2022 An NFC card provides fast and easy user experiences.\n\u2022 TAPSIGNER is a great way to keep your keys separate from your wallet(s) \n\u2022 The card form factor makes it easy to carry and easy to conceal',
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
          'The goal of SeedSigner is to lower the cost and complexity of Bitcoin multi-signature wallet use. To accomplish this goal, SeedSigner offers anyone the opportunity to build a verifiably air-gapped, stateless Bitcoin signer using inexpensive, publicly available hardware components (usually < $50).',
        assert: <SeedSigner />,
        description:
          '\u2022 SeedSigner helps users save with Bitcoin by assisting with trustless private key generation and multi-signature wallet setup. \n\u2022  It also help users transact with Bitcoin via a secure, air-gapped QR-exchange signing model.',
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
        FAQ: 'https://help.bitcoinkeeper.app/knowledge-base/how-to-add-signing-devices/',
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
        title: 'Keeper as signer',
        subTitle: 'You can use a specific BIP-85 wallet on Collaborative Key as a signer',
        assert: <KeeperSetupImage />,
        description:
          '\u2022Make sure that the other Keeper app is backed up using the 12-word Recovery Phrase.\n\u2022 When you want to sign a transaction using this option, you will have to navigate to the specific wallet used',
        FAQ: '',
      };
    case SignerType.POLICY_SERVER:
      return {
        title: 'Signing Server',
        subTitle:
          'The key on the signer will sign a transaction depending on the policy and authentication',
        assert: <SigningServerIllustration />,
        description:
          '\u2022An auth app provides the 6-digit authentication code.\n\u2022 When restoring the app using signers, you will need to provide this code. \n\u2022 Considered a hot key as it is on a connected online server',
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
    case SignerType.INHERITANCEKEY:
      return {
        title: 'Inheritance Key',
        subTitle: 'Secure your legacy with the Inheritance Key feature in Keeper.',
        assert: <InhertanceKeyIcon />,
        description:
          '\u2022Prepare for the future by using a 3-of-6 multisig setup with one key being an Inheritance Key.\n\u2022 Ensure a seamless transfer of assets while maintaining control over your financial legacy.',
        FAQ: `${KEEPER_KNOWLEDGEBASE}knowledge-base/how-to-setup-inheritance-in-keeper-app/`,
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

function SigningDeviceDetails({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { vaultKey, vaultId, signer: currentSigner, vaultSigners } = route.params;
  const { signerMap } = useSignerMap();
  const signer = currentSigner ? currentSigner : signerMap[vaultKey.masterFingerprint];
  const [detailModal, setDetailModal] = useState(false);
  const [skipHealthCheckModalVisible, setSkipHealthCheckModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [identifySignerModal, setIdentifySignerModal] = useState(false);
  const { showToast } = useToastMessage();
  const { activeVault } = useVault({ vaultId });
  const { primaryMnemonic }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];

  const [healthCheckArray, setHealthCheckArray] = useState([]);

  useEffect(() => {
    if (signer) {
      setHealthCheckArray([
        { name: 'Health Check Successful', lastHealthCheck: signer.lastHealthCheck },
      ]);
    }
  }, []);

  if (!signer) {
    return null;
  }

  const { title, subTitle, assert, description, FAQ } = getSignerContent(signer?.type);
  function SignerContent() {
    return (
      <Box>
        <Center>{assert}</Center>
        <Text
          color="light.white"
          style={{
            fontSize: 13,
            letterSpacing: 0.65,
            marginTop: hp(25),
          }}
        >
          {description}
        </Text>
      </Box>
    );
  }

  function HealthCheckSkipContent() {
    return (
      <Box>
        <Box style={styles.skipHealthIllustration}>
          <SkipHealthCheck />
        </Box>
        <Text>
          You can choose to manually confirm the health of the signer if you are sure that they are
          secure and accessible. Or you can choose to do the Health Check when you can
        </Text>
      </Box>
    );
  }

  function FooterIcon({ Icon }) {
    return (
      <Box
        margin="1"
        width="12"
        height="12"
        borderRadius={30}
        backgroundColor={`${colorMode}.RussetBrown`}
        justifyContent="center"
        alignItems="center"
      >
        <Icon />
      </Box>
    );
  }

  const identifySigner = signer.type === SignerType.OTHER_SD;

  const footerItems = [
    {
      text: 'Health Check',
      Icon: () => <FooterIcon Icon={HealthCheck} />,
      onPress: () => {
        if (signer.type === SignerType.UNKOWN_SIGNER) {
          navigation.dispatch(
            CommonActions.navigate({
              name: 'AssignSignerType',
              params: {
                parentNavigation: navigation,
                vault: activeVault,
              },
            })
          );
        } else {
          setVisible(true);
        }
      },
    },
    {
      text: 'Settings',
      Icon: () => <FooterIcon Icon={AdvnaceOptions} />,
      onPress: () => {
        navigation.dispatch(
          CommonActions.navigate('SignerAdvanceSettings', { signer, vaultKey, vaultId })
        );
      },
    },
  ];

  if (vaultKey) {
    footerItems.push({
      text: 'Change Signer',
      Icon: () => <FooterIcon Icon={Change} />,
      onPress: () =>
        navigation.dispatch(
          CommonActions.navigate({
            name: 'AddSigningDevice',
            merge: true,
            params: { vaultId, scheme: activeVault.scheme },
          })
        ),
    });
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        learnMore
        learnMorePressed={() => setDetailModal(true)}
        learnTextColor={`${colorMode}.white`}
        title={signer.signerName}
        subtitle={
          signer.signerDescription || `Added on ${moment(signer.addedOn).calendar().toLowerCase()}`
        }
        icon={
          <CircleIconWrapper
            backgroundColor={`${colorMode}.primaryGreenBackground`}
            icon={SDIcons(signer.type, true).Icon}
          />
        }
        rightComponent={<CurrencyTypeSwitch />}
      />
      <Box>
        <Text style={styles.recentHistoryText}>Recent History</Text>
      </Box>
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        <Box mx={5}>
          {healthCheckArray.map((_, index) => (
            <SigningDeviceChecklist item={signer} key={index.toString()} />
          ))}
        </Box>
      </ScrollView>
      <KeeperFooter marginX={5} wrappedScreen={false} items={footerItems} />
      <HardwareModalMap
        type={signer?.type}
        visible={visible}
        close={() => setVisible(false)}
        signer={signer}
        skipHealthCheckCallBack={() => {
          setVisible(false);
          setSkipHealthCheckModalVisible(true);
        }}
        mode={InteracationMode.HEALTH_CHECK}
        isMultisig={activeVault?.isMultiSig || true}
        primaryMnemonic={primaryMnemonic}
        vaultId={vaultId}
        addSignerFlow={false}
        vaultSigners={vaultSigners}
      />
      <KeeperModal
        visible={skipHealthCheckModalVisible}
        close={() => setSkipHealthCheckModalVisible(false)}
        title="Skipping Health Check"
        subTitle="It is very important that you keep your signers secure and fairly accessible at all times."
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
        Content={HealthCheckSkipContent}
      />
      <KeeperModal
        visible={detailModal}
        close={() => setDetailModal(false)}
        title={title}
        subTitle={subTitle}
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor="light.white"
        learnMoreCallback={() => openLink(FAQ)}
        Content={SignerContent}
        DarkCloseIcon
        learnMore
      />
      <IdentifySignerModal
        visible={identifySigner && identifySignerModal}
        close={() => setIdentifySignerModal(false)}
        signer={signer}
        secondaryCallback={() => {
          setVisible(true);
        }}
        vaultId={vaultId}
      />
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  skipHealthIllustration: {
    marginLeft: wp(25),
  },
  walletHeaderWrapper: {
    margin: wp(15),
    flexDirection: 'row',
    width: '100%',
  },
  walletIconWrapper: {
    width: '15%',
  },
  walletIconView: {
    height: 40,
    width: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletDescText: {
    fontSize: 14,
  },
  walletNameWrapper: {
    width: '85%',
    marginLeft: 10,
  },
  walletNameText: {
    fontSize: 20,
  },
  recentHistoryText: { fontSize: 16, padding: '7%' },
});

export default SigningDeviceDetails;
