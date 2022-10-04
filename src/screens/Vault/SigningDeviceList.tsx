import { Box, Text } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import Alert from 'src/assets/images/alert_illustration.svg';
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
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import { TouchableOpacity } from 'react-native';
import { WalletMap } from './WalletMap';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { manager } from 'src/core/services/ble';
import { useAppSelector } from 'src/store/hooks';
import useSigningList from 'src/hooks/useSigningList';

type HWProps = {
  type: SignerType;
  first?: boolean;
  last?: boolean;
};

const findKeyInServer = (vaultSigners, type: SignerType) => {
  return vaultSigners.find(
    (element) =>
      element.type === type
  );
};

const SigningDeviceList = ({ navigation }: { navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];

  const isOnPleb = subscription.name.toLowerCase() === SubscriptionTier.PLEB;
  const vaultSigners = useAppSelector((state) => state.vault.signers);

  const [nfcAlert, setNfcAlert] = useState(false);
  const [isNfcSupported, setNfcSupport] = useState(true);
  const [isBLESupported, setBLESupport] = useState(false);
  const vault = translations['vault'];

  const getNfcSupport = async () => {
    const isSupported = await NFC.isNFCSupported();
    setNfcSupport(isSupported);
  };

  const getBluetoothSupport = () => {
    manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        setBLESupport(true);
      } else {
        setBLESupport(false);
      }
    }, true);
  };

  const getDisabled = (type: SignerType) => {
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

  useEffect(() => {
    getNfcSupport();
    getBluetoothSupport();
  }, []);

  const getDeviceStatus = (type: SignerType) => {
    switch (type) {
      case SignerType.COLDCARD:
        return {
          message: !isNfcSupported ? 'NFC is not supported in your device' : '',
          disabled: !isNfcSupported,
        };
      case SignerType.LEDGER:
        return {
          message: !isBLESupported ? 'BLE is not enabled in your device' : '',
          disabled: !isBLESupported,
        };
      case SignerType.MOBILE_KEY:
        return {
          message: getDisabled(type).message,
          disabled: getDisabled(type).disabled,
        };
      case SignerType.POLICY_SERVER:
        return {
          message: getDisabled(type).message,
          disabled: getDisabled(type).disabled,
        };
      case SignerType.TAPSIGNER:
        return {
          message: !isNfcSupported ? 'NFC is not supported in your device' : '',
          disabled: !isNfcSupported,
        };
      case SignerType.SEED_WORDS:
        return {
          message: getDisabled(type).message,
          disabled: getDisabled(type).disabled,
        };
      case SignerType.KEEPER:
        return {
          message: getDisabled(type).message,
          disabled: getDisabled(type).disabled,
        };
      default:
        return {
          message: '',
          disabled: false,
        };
    }
  };

  const sortedSigners = useSigningList(isNfcSupported, isBLESupported, getDeviceStatus);
  const HardWareWallet = ({ type, first = false, last = false }: HWProps) => {
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
          disabled={getDeviceStatus(type).disabled}
          style={{
            opacity: getDeviceStatus(type).disabled ? 0.4 : 1,
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
                  {getDeviceStatus(type).message}
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
      />
      <Box alignItems={'center'} justifyContent={'center'}>
        <ScrollView style={{ height: hp(520) }} showsVerticalScrollIndicator={false}>
          <Box paddingY={'4'}>
            {sortedSigners?.map((type: SignerType, index: number) => (
              <HardWareWallet type={type} first={index === 0} last={index === 9} />
            ))}
          </Box>
        </ScrollView>
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
          butt
          Content={nfcAlertConternt}
        />
      </Box>
    </ScreenWrapper>
  );
};

export default SigningDeviceList;
