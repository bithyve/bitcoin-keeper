import { Box, Text, View } from 'native-base';
import React, { useContext, useState } from 'react';
import { windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import { CommonActions } from '@react-navigation/native';
import HeaderTitle from 'src/components/HeaderTitle';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { SignerType } from 'src/core/wallets/interfaces/enum';
import TapSigner from 'src/assets/images/svgs/tapsigner.svg';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import { TouchableOpacity } from 'react-native';
import { WalletMap } from './WalletMap';

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
            <Box justifyContent={'center'} alignItems={'center'} height={windowHeight * 0.08}>
              {WalletMap(type).Logo}
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
    <SafeAreaView style={styles.container}>
      <HeaderTitle
        title="Select a Signer"
        subtitle="For your Vault"
        onPressHandler={() => navigation.navigate('NewHome')}
        headerTitleColor={'light.headerTextTwo'}
      />
      <Box alignItems={'center'} justifyContent={'center'}>
        <Box paddingY={'4'}>
          {[
            'COLDCARD',
            'JADE',
            'KEEPER',
            'KEYSTONE',
            'LEDGER',
            'PASSPORT',
            'TAPSIGNER',
            'TREZOR',
            'POLICY_SERVER',
            'MOBILE_KEY',
          ].map((type: SignerType, index: number) => (
            <HardWareWallet type={type} first={index === 0} last={index === 9} />
          ))}
        </Box>
        <Text
          fontSize={RFValue(12)}
          letterSpacing={0.6}
          fontWeight={100}
          color={'light.lightBlack'}
          width={wp(300)}
          lineHeight={20}
        >
          A Signer can be a hardware wallet or a signing device or an app. Most popular ones are
          listed above. Want support for more.{' '}
          <Text fontStyle={'italic'} fontWeight={'bold'}>
            Contact Us
          </Text>
        </Text>
      </Box>
    </SafeAreaView>
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
