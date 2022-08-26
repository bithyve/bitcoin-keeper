import { Box, Text } from 'native-base';
import React, { useContext, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import HardwareModalMap from './HardwareModalMap';
import HeaderTitle from 'src/components/HeaderTitle';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { ScrollView } from 'react-native-gesture-handler';
import { SignerType } from 'src/core/wallets/enums';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { TouchableOpacity } from 'react-native';
import { WalletMap } from './WalletMap';

type HWProps = {
  type: SignerType;
  first?: boolean;
  last?: boolean;
};

const HardwareWalletSetup = ({ navigation }: { navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const vault = translations['vault'];
  const HardWareWallet = ({ type, first = false, last = false }: HWProps) => {
    const [visible, setVisible] = useState(false);
    const onPress = () => {
      open();
    };

    const open = () => setVisible(true);
    const close = () => setVisible(false);

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
        <HardwareModalMap visible={visible} close={close} type={type} />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <Box marginX={10}>
        <HeaderTitle
          title={vault.SelectSigner}
          subtitle={vault.ForVault}
          onPressHandler={() => navigation.navigate('NewHome')}
          headerTitleColor={'light.headerTextTwo'}
        />
      </Box>
      <Box alignItems={'center'} justifyContent={'center'}>
        <ScrollView style={{ height: hp(520) }} showsVerticalScrollIndicator={false}>
          <Box paddingY={'4'}>
            {[
              'COLDCARD',
              'TAPSIGNER',
              'LEDGER',
              'TREZOR',
              'KEYSTONE',
              'PASSPORT',
              'JADE',
              // 'KEEPER',
              'POLICY_SERVER',
              'MOBILE_KEY',
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
