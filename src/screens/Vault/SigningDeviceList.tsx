import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Box, Text } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import config, { APP_STAGE } from 'src/core/config';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import Alert from 'src/assets/images/alert_illustration.svg';
import { BleManager } from 'react-native-ble-plx';
import HardwareModalMap from './HardwareModalMap';
import HeaderTitle from 'src/components/HeaderTitle';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import NFC from 'src/core/services/nfc';
import { RFValue } from 'react-native-responsive-fontsize';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import { SignerType } from 'src/core/wallets/enums';
import SigningDevicesIllustration from 'src/assets/images/svgs/illustration_SD.svg';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import { WalletMap } from './WalletMap';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import openLink from 'src/utils/OpenLink';
import { setSdIntroModal } from 'src/store/reducers/vaults';

type HWProps = {
  type: SignerType;
  disabled: boolean;
  message: string;
  first?: boolean;
  last?: boolean;
};

const findKeyInServer = (vaultSigners, type: SignerType) => {
  return vaultSigners.find((element) => element.type === type);
};

const getDisabled = (type: SignerType, isOnPleb, vaultSigners) => {
  // Keys Incase of level 1 we have level 1
  if (isOnPleb) {
    return { disabled: true, message: 'Upgrade to use these keys' };
  }
  // Keys Incase of already added
  if (findKeyInServer(vaultSigners, type)) {
    return { disabled: true, message: 'Key already added to the Vault.' };
  }
  return { disabled: false, message: '' };
};

const getDeviceStatus = (
  type: SignerType,
  isNfcSupported,
  isBLESupported,
  isOnPleb,
  vaultSigners
) => {
  switch (type) {
    case SignerType.COLDCARD:
    case SignerType.TAPSIGNER:
      return {
        message: !isNfcSupported ? 'NFC is not supported in your device' : '',
        disabled: config.ENVIRONMENT !== APP_STAGE.DEVELOPMENT && !isNfcSupported,
      };
    case SignerType.LEDGER:
      return {
        message: !isBLESupported ? 'BLE is not enabled in your device' : '',
        disabled: config.ENVIRONMENT !== APP_STAGE.DEVELOPMENT && !isBLESupported,
      };
    case SignerType.MOBILE_KEY:
    case SignerType.POLICY_SERVER:
    case SignerType.SEED_WORDS:
    case SignerType.KEYSTONE:
    case SignerType.KEEPER:
      return {
        message: getDisabled(type, isOnPleb, vaultSigners).message,
        disabled: getDisabled(type, isOnPleb, vaultSigners).disabled,
      };

    case SignerType.TREZOR:
      return {
        message: 'Coming soon',
        disabled: false,
      };
    case SignerType.JADE:
    case SignerType.PASSPORT:
    case SignerType.SEEDSIGNER:
    default:
      return {
        message: '',
        disabled: false,
      };
  }
};

const SigningDeviceList = ({ navigation }: { navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const dispatch = useAppDispatch();
  const isOnPleb = subscription.name.toLowerCase() === SubscriptionTier.PLEB.toLowerCase();
  const vaultSigners = useAppSelector((state) => state.vault.signers);
  const sdModal = useAppSelector((state) => state.vault.sdIntroModal);

  const [nfcAlert, setNfcAlert] = useState(false);
  const [isNfcSupported, setNfcSupport] = useState(true);
  const [isBLESupported, setBLESupport] = useState(false);
  const [signersLoaded, setSignersLoaded] = useState(false);

  const vault = translations['vault'];

  const getNfcSupport = async () => {
    const isSupported = await NFC.isNFCSupported();
    setNfcSupport(isSupported);
    setSignersLoaded(true);
  };

  const VaultSetupContent = () => {
    return (
      <View>
        <Box alignSelf={'center'}>
          <SigningDevicesIllustration />
        </Box>
        <Text color={'light.white'} style={styles.modalText}>
          {`For the Pleb tier, you need to select one signing device to activate your vault. This can be upgraded to three signing devices and five signing devices on Hodler and Diamond Hands tiers\n\nIf a particular signing device is not supported, it will be indicated.`}
        </Text>
      </View>
    );
  };

  const getBluetoothSupport = () => {
    new BleManager().onStateChange((state) => {
      if (state === 'PoweredOn') {
        setBLESupport(true);
      } else {
        setBLESupport(false);
      }
    }, true);
  };

  useEffect(() => {
    getBluetoothSupport();
    getNfcSupport();
  }, []);

  const sortedSigners = [
    SignerType.COLDCARD,
    SignerType.LEDGER,
    SignerType.TREZOR,
    SignerType.TAPSIGNER,
    SignerType.SEEDSIGNER,
    SignerType.PASSPORT,
    SignerType.JADE,
    SignerType.KEYSTONE,
    SignerType.MOBILE_KEY,
    SignerType.POLICY_SERVER,
    SignerType.KEEPER,
    SignerType.SEED_WORDS,
  ];
  const HardWareWallet = ({ type, disabled, message, first = false, last = false }: HWProps) => {
    const [visible, setVisible] = useState(false);

    const onPress = () => {
      open();
    };

    const open = () => setVisible(true);
    const close = () => setVisible(false);

    return (
      <React.Fragment key={type}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          disabled={disabled}
          style={{
            opacity: disabled ? 0.4 : 1,
          }}
        >
          <Box
            backgroundColor={'light.lightYellow'}
            borderTopRadius={first ? 15 : 0}
            borderBottomRadius={last ? 15 : 0}
          >
            <Box
              alignItems={'center'}
              height={windowHeight * 0.08}
              flexDirection={'row'}
              style={{
                paddingLeft: wp(40),
              }}
            >
              <Box
                style={{
                  marginRight: wp(20),
                  width: wp(15),
                }}
              >
                {WalletMap(type).Icon}
              </Box>
              <Box opacity={0.3} backgroundColor={'light.divider'} height={hp(24)} width={0.5} />
              <Box
                style={{
                  marginLeft: wp(23),
                  justifyContent: 'flex-end',
                  marginTop: hp(20),
                }}
              >
                {WalletMap(type).Logo}
                <Text
                  color={'light.inActiveMsg'}
                  fontSize={10}
                  fontWeight={200}
                  letterSpacing={1.3}
                  marginTop={hp(5)}
                >
                  {message}
                </Text>
              </Box>
            </Box>
            <Box
              opacity={0.1}
              backgroundColor={'light.divider'}
              width={windowWidth * 0.8}
              height={0.5}
            />
          </Box>
        </TouchableOpacity>
        <HardwareModalMap visible={visible} close={close} type={type} />
      </React.Fragment>
    );
  };

  const nfcAlertConternt = () => {
    return (
      <Box>
        <Box justifyContent={'center'} alignItems={'center'}>
          <Alert />
        </Box>
        <Text
          fontSize={13}
          fontWeight={200}
          letterSpacing={0.65}
          width={wp(260)}
          color={'light.modalText'}
          marginY={4}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        </Text>
      </Box>
    );
  };

  return (
    <ScreenWrapper>
      <HeaderTitle
        title={vault.SelectSigner}
        subtitle={vault.ForVault}
        headerTitleColor={'light.headerTextTwo'}
        learnMore={true}
        learnMorePressed={() => {
          dispatch(setSdIntroModal(true));
        }}
      />
      <Box alignItems={'center'} justifyContent={'center'}>
        <ScrollView style={{ height: '90%' }} showsVerticalScrollIndicator={false}>
          {!signersLoaded ? (
            <ActivityIndicator />
          ) : (
            <Box paddingY={'4'}>
              {sortedSigners?.map((type: SignerType, index: number) => {
                const { disabled, message } = getDeviceStatus(
                  type,
                  isNfcSupported,
                  isBLESupported,
                  isOnPleb,
                  vaultSigners
                );
                return (
                  <HardWareWallet
                    type={type}
                    first={index === 0}
                    last={index === 9}
                    disabled={disabled}
                    message={message}
                  />
                );
              })}
              <Text
                fontSize={RFValue(12)}
                letterSpacing={0.6}
                fontWeight={100}
                color={'light.lightBlack'}
                width={wp(300)}
                lineHeight={20}
                marginTop={hp(20)}
              >
                {vault.VaultInfo}{' '}
                <Text fontStyle={'italic'} fontWeight={'bold'}>
                  Contact Us
                </Text>
              </Text>
            </Box>
          )}
        </ScrollView>
        <KeeperModal
          visible={nfcAlert}
          close={() => {
            setNfcAlert(false);
          }}
          title={'NFC Not supported'}
          subTitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed '}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'  CTA  '}
          buttonTextColor={'#FAFAFA'}
          textColor={'#041513'}
          Content={nfcAlertConternt}
        />
        <KeeperModal
          visible={sdModal}
          close={() => {
            dispatch(setSdIntroModal(false));
          }}
          title={'Signing Devices'}
          subTitle={
            'A signing device is a piece of hardware or software that stores one of the private keys needed for your vault'
          }
          modalBackground={['#00836A', '#073E39']}
          buttonBackground={['#FFFFFF', '#80A8A1']}
          buttonText={'Add Now'}
          buttonTextColor={'#073E39'}
          buttonCallback={() => {
            dispatch(setSdIntroModal(false));
          }}
          textColor={'#FFF'}
          Content={VaultSetupContent}
          DarkCloseIcon={true}
          learnMore={true}
          learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
        />
      </Box>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  modalText: {
    letterSpacing: 0.65,
    fontSize: 13,
    marginTop: 5,
    padding: 1,
  },
});
export default SigningDeviceList;
