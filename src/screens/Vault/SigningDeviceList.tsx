import { Box, Text } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import Alert from 'src/assets/images/alert_illustration.svg';
import HardwareModalMap from './HardwareModalMap';
import HeaderTitle from 'src/components/HeaderTitle';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import NFC from 'src/core/services/nfc';
import { RFValue } from 'react-native-responsive-fontsize';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { ScrollView } from 'react-native-gesture-handler';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { TouchableOpacity } from 'react-native';
import { WalletMap } from './WalletMap';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { manager } from 'src/core/services/ble';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import StatusBarComponent from 'src/components/StatusBarComponent';

type HWProps = {
  type: SignerType;
  first?: boolean;
  last?: boolean;
};

export const getBluetoothSupport = () => {
  const subscription = manager.onStateChange((state) => {
    if (state === 'PoweredOn') {
      return true
    }
    return false
  }, true);
  return false
}
export const getNfcSupport = async () => {
  const isSupported = await NFC.isNFCSupported();
  return isSupported;
};

const findKeyInServer = () => {
  const vaultSigners = useAppSelector((state) => state.vault.signers);
  return vaultSigners.find(element => element.storageType === SignerStorage.HOT || element.storageType === SignerStorage.WARM);
}
export const getDisabled = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];

  // Keys Incase of level 1 we have level 1
  if (subscription.name.toLowerCase() === SubscriptionTier.PLEB) {
    return { disabled: true, message: 'Upgrade to use these keys' };
  }
  // Keys Incase of already added 
  if (findKeyInServer()) {
    return { disabled: true, message: 'Key already added to the Vault.' }
  }
  return { disabled: false, message: '' }
}

const SigningDeviceList = ({ navigation }: { navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const [nfcAlert, setNfcAlert] = useState(false);
  const vault = translations['vault'];

  const HardWareWallet = ({ type, first = false, last = false }: HWProps) => {
    const disabled = useAppSelector((state) =>
      state.vault.signers.filter(
        (signer) =>
          signer.type === type &&
          (type === SignerType.MOBILE_KEY || type === SignerType.POLICY_SERVER)
      )
    );
    const { showToast } = useToastMessage();
    const [visible, setVisible] = useState(false);
    const [disable, setDisable] = useState(WalletMap(type).disable);
    let isDisable = WalletMap(type).disable;

    useEffect(() => {
      setDisable(isDisable)
    }, [isDisable])

    const onPress = () => {
      if (!!disabled.length) {
        showToast(
          `There can only be one ${type.toLowerCase().split('_').join(' ')} to create a Vault`
        );
        return;
      }
      open();
    };

    const open = () => setVisible(true);
    const close = () => setVisible(false);

    return (
      <>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          disabled={disable}
          style={{
            opacity: disable ? 0.4 : 1
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
                  marginTop: hp(20)
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
                  {WalletMap(type).message}
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
      </>
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
      <StatusBarComponent padding={hp(50)} />
      <HeaderTitle
        title={vault.SelectSigner}
        subtitle={vault.ForVault}
        headerTitleColor={'light.headerTextTwo'}
      />
      <Box alignItems={'center'} justifyContent={'center'}>
        <ScrollView style={{ height: hp(520) }} showsVerticalScrollIndicator={false}>
          <Box paddingY={'4'}>
            {[
              'MOBILE_KEY',
              'POLICY_SERVER',
              'TREZOR',
              'KEYSTONE',
              'PASSPORT',
              'JADE',
              'LEDGER',
              'TAPSIGNER',
              'COLDCARD',
            ].map((type: SignerType, index: number) => (
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
