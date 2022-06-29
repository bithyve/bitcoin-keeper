import { Box, Text, View } from 'native-base';
import React, { useContext, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import { CommonActions } from '@react-navigation/native';
import HeaderTitle from 'src/components/HeaderTitle';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { SignerType } from 'src/core/wallets/enums';
import TapSigner from 'src/assets/images/svgs/tapsigner.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import { TouchableOpacity } from 'react-native';
import { WalletMap } from './WalletMap';
import StatusBarComponent from 'src/components/StatusBarComponent';

type HWProps = {
  type: SignerType;
  first?: boolean;
  last?: boolean;
};

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
const HardwareWalletSetup = ({ navigation }: { navigation }) => {
  const HardWareWallet = ({ type, first = false, last = false }: HWProps) => {
    const navigateToTapsignerSetup = () => {
      close();
      navigation.dispatch(CommonActions.navigate({ name: 'AddTapsigner', params: {} }));
    };
    const [visible, setVisible] = useState(false);

    const { translations } = useContext(LocalizationContext);
    const tapsigner = translations['tapsigner'];

    const onPress = () => {
      open();
    };

    const close = () => setVisible(false);
    const open = () => setVisible(true);

    return (
      <>
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
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
                paddingLeft: wp(40)
              }}
            >
              <Box
                style={{
                  marginRight: wp(20),
                  width: wp(15)
                }}>
                {WalletMap(type).Icon}
              </Box>
              <Box
                opacity={0.3}
                backgroundColor={'light.divider'}
                height={hp(24)}
                width={0.5}
              />
              <Box
                style={{
                  marginLeft: wp(23)
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
          visible={visible}
          close={close}
          title={tapsigner.SetupTitle}
          subTitle={tapsigner.SetupDescription}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'Setup'}
          buttonTextColor={'#FAFAFA'}
          buttonCallback={navigateToTapsignerSetup}
          textColor={'#041513'}
          Content={TapsignerSetupContent}
        />
      </>
    );
  };

  return (
    <Box>
      <SafeAreaView style={styles.container}>
        <StatusBarComponent />
        <Box marginX={10}>
          <HeaderTitle
            title="Select a Signer"
            subtitle="For your Vault"
            onPressHandler={() => navigation.navigate('NewHome')}
            headerTitleColor={'light.headerTextTwo'}
          />
        </Box>
        <Box alignItems={'center'} justifyContent={'center'}>
          <ScrollView style={{ height: hp(520) }} showsVerticalScrollIndicator={false}>
            <Box paddingY={'4'}>
              {[
                'COLDCARD',
                'JADE',
                'KEYSTONE',
                'TAPSIGNER',
                'PASSPORT',
                'LEDGER',
                'TREZOR',
                'KEEPER',
                // 'POLICY_SERVER',
                // 'MOBILE_KEY',
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
            A Signer can be a hardware wallet or a signing device or an app. Most popular ones are
            listed above. Want support for more.{' '}
            <Text fontStyle={'italic'} fontWeight={'bold'}>
              Contact Us
            </Text>
          </Text>
        </Box>
      </SafeAreaView>
    </Box>
  );
};

const styles = ScaledSheet.create({
  container: {},
  dummy: {
    height: 200,
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#092C27',
    opacity: 0.15,
  },
});

export default HardwareWalletSetup;
