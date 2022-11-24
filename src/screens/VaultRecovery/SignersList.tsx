import { Box, ScrollView, Text, View } from 'native-base';
import React, { useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import SeedSignerSetupImage from 'src/assets/images/seedsigner_setup.svg';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import KeeperModal from 'src/components/KeeperModal';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { WalletMap } from '../Vault/WalletMap';
import { CommonActions, useNavigation } from '@react-navigation/native';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { SigningDeviceRecovery } from 'src/common/data/enums/BHR';
import { useDispatch } from 'react-redux';
import { setSigningDevices } from 'src/store/reducers/bhr';
import { captureError } from 'src/core/services/sentry';
import { getPassportDetails } from 'src/hardware/passport';
import { getSeedSignerDetails } from 'src/hardware/seedsigner';
import config from 'src/core/config';

const TapsignerSetupContent = () => {
  return (
    <View>
      <TapsignerSetupImage />
      <Box marginTop={'4'}>
        <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} p={1}>
          {`\u2022 You will need the Pin/CVC at the back of TAPSIGNER`}
        </Text>
        <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} p={1}>
          {'\u2022 Make sure that TAPSIGNER is not used as a Signer on other apps'}
        </Text>
      </Box>
    </View>
  );
};

const ColdCardSetupContent = () => {
  return (
    <View justifyContent={'flex-start'} width={wp(300)}>
      <Box ml={wp(21)}>
        <ColdCardSetupImage />
      </Box>
      <Box marginTop={'4'} alignItems={'flex-start'}>
        <Box flex={1} flexDirection={'row'} alignItems={'space-between'} justifyContent={'center'}>
          <Box mb={hp(19)} mx={wp(10)} flexDirection={'row'}>
            <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} ml={3}>
              {`\u2022 Export the xPub by going to Settings > Multisig wallet > Export xPub. From here choose the NFC option to make the transfer and remember the account you had chosen (This is important for recovering your vault).\n`}
            </Text>
          </Box>
        </Box>
        <Box flex={1} flexDirection={'row'} alignItems={'space-between'} justifyContent={'center'}>
          <Box mb={hp(19)} mx={wp(10)} flexDirection={'row'}>
            <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} ml={3}>
              {`\u2022 Make sure you enable Testnet mode on the coldcard if you are running the app in the Testnet more from Advance option > Danger Zone > Testnet and enable it`}
            </Text>
          </Box>
        </Box>
      </Box>
    </View>
  );
};

const PassportSetupContent = () => {
  return (
    <View>
      <Box ml={wp(21)}>
        <ColdCardSetupImage />
      </Box>
      <Box marginTop={'4'}>
        <Text
          color={'#073B36'}
          fontSize={13}
          fontWeight={200}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Export the xPub from the Account section > Manage Account > Connect Wallet > Keeper > Multisig > QR Code.\n`}
        </Text>
        <Text
          color={'#073B36'}
          fontSize={13}
          fontWeight={200}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Make sure you enable Testnet mode on the Passport if you are running the app in the Testnet mode from Settings > Bitcoin > Network > Testnet and enable it`}
        </Text>
      </Box>
    </View>
  );
};

const SeedSignerSetupContent = () => {
  return (
    <View>
      <Box ml={wp(21)}>
        <SeedSignerSetupImage />
      </Box>
      <Box marginTop={'4'}>
        <Text
          color={'#073B36'}
          fontSize={13}
          fontWeight={200}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Make sure the seed is loaded and export the xPub by going to Seeds > Select your master fingerprint > Export Xpub > Multisig > Nested Segwit > Keeper.\n`}
        </Text>
        <Text
          color={'#073B36'}
          fontSize={13}
          fontWeight={200}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {`\u2022 Make sure you enable Testnet mode on the SeedSigner if you are running the app in the Testnet mode from Settings > Adavnced > Bitcoin network > Testnet and enable it`}
        </Text>
      </Box>
    </View>
  );
};

const SignersList = () => {
  type HWProps = {
    type: SignerType;
    first?: boolean;
    last?: boolean;
  };

  const { navigate } = useNavigation();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const verifyPassport = async (qrData) => {
    try {
      const { xpub } = getPassportDetails(qrData);
      const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
      const sigingDeivceDetails: SigningDeviceRecovery = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        xpub,
        type: SignerType.PASSPORT,
      };
      dispatch(setSigningDevices(sigingDeivceDetails));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      console.log(err);
      captureError(err);
    }
  };

  const verifySeedSigner = async (qrData) => {
    try {
      let { xpub } = getSeedSignerDetails(qrData);
      const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
      const sigingDeivceDetails: SigningDeviceRecovery = {
        signerId: WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
        xpub: xpub,
        type: SignerType.SEEDSIGNER,
      };
      dispatch(setSigningDevices(sigingDeivceDetails));
      navigation.navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
    } catch (err) {
      console.log(err);
      captureError(err);
    }
  };

  const HardWareWallet = ({ type, first = false, last = false }: HWProps) => {
    const [visible, setVisible] = useState(false);
    const onPress = () => {
      open();
    };

    const open = () => setVisible(true);
    const close = () => setVisible(false);

    const onQRScan = (qrData) => {
      switch (type as SignerType) {
        case SignerType.PASSPORT:
          return verifyPassport(qrData);
        case SignerType.SEEDSIGNER:
          return verifySeedSigner(qrData);
        case SignerType.KEYSTONE:
        case SignerType.JADE:
        default:
          return;
      }
    };

    const navigateToAddQrBasedSigner = () => {
      close();
      navigation.dispatch(
        CommonActions.navigate({
          name: 'QrRecovery',
          params: {
            title: `Setting up ${type}`,
            subtitle: 'Please scan until all the QR data has been retrieved',
            onQrScan: onQRScan,
          },
        })
      );
    };

    return (
      <>
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
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
                paddingVertical: hp(25),
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
                }}
              >
                {WalletMap(type).Logo}
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
        <KeeperModal
          visible={visible && type === SignerType.TAPSIGNER}
          close={close}
          title={'Verify TAPSIGNER'}
          subTitle={'Keep your TAPSIGNER ready'}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'Verify'}
          buttonTextColor={'#FAFAFA'}
          buttonCallback={() => {
            navigate('TapSignerRecovery');
            close();
          }}
          textColor={'#041513'}
          Content={TapsignerSetupContent}
        />
        <KeeperModal
          visible={visible && type === SignerType.COLDCARD}
          close={close}
          title={'Verify Coldcard'}
          subTitle={'Keep your Coldcard ready'}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'Proceed'}
          buttonTextColor={'#FAFAFA'}
          buttonCallback={() => {
            navigate('ColdCardReocvery');
            close();
          }}
          textColor={'#041513'}
          Content={ColdCardSetupContent}
        />
        <KeeperModal
          visible={visible && type === SignerType.PASSPORT}
          close={close}
          title={'Setting up Passport (Batch 2)'}
          subTitle={'Keep your Foundation Passport (Batch 2) ready before proceeding'}
          subTitleColor={'#5F6965'}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'Continue'}
          buttonTextColor={'#FAFAFA'}
          buttonCallback={navigateToAddQrBasedSigner}
          textColor={'#041513'}
          Content={PassportSetupContent}
        />
        <KeeperModal
          visible={visible && type === SignerType.SEEDSIGNER}
          close={close}
          title={'Setting up SeedSigner'}
          subTitle={'Keep your SeedSigner ready and powered before proceeding'}
          subTitleColor={'#5F6965'}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'Continue'}
          buttonTextColor={'#FAFAFA'}
          buttonCallback={navigateToAddQrBasedSigner}
          textColor={'#041513'}
          Content={SeedSignerSetupContent}
        />
      </>
    );
  };

  return (
    <ScreenWrapper>
      <HeaderTitle
        title={'Select Signing Device'}
        subtitle={'To recover your vault'}
        headerTitleColor={'light.textBlack'}
        paddingTop={hp(5)}
      />
      <ScrollView style={{ height: hp(520) }} showsVerticalScrollIndicator={false}>
        <Box paddingY={'4'}>
          {[
            SignerType.TAPSIGNER,
            SignerType.COLDCARD,
            SignerType.SEEDSIGNER,
            SignerType.PASSPORT,
          ].map((type: SignerType, index: number) => (
            <HardWareWallet type={type} first={index === 0} last={index === 3} />
          ))}
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default SignersList;
