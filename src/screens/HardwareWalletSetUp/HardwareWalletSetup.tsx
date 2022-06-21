import { Box, Text } from 'native-base';
import { windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import HeaderTitle from 'src/components/HeaderTitle';
import { RFValue } from 'react-native-responsive-fontsize';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import TapSigner from 'src/assets/images/svgs/tapsigner.svg';

type HWProps = {
  Icon;
  first?: boolean;
  last?: boolean;
};
const HardwareWalletSetup = ({ navigation }: { navigation }) => {
  const HardWareWallet = ({ Icon, first = false, last = false }: HWProps) => {
    return (
      <Box
        backgroundColor={'light.lightYellow'}
        borderTopRadius={first ? 15 : 0}
        borderBottomRadius={last ? 15 : 0}
      >
        <Box justifyContent={'center'} alignItems={'center'} height={windowHeight * 0.08}>
          <Icon />
        </Box>
        <Box
          opacity={0.1}
          backgroundColor={'light.divider'}
          width={windowWidth * 0.8}
          height={0.5}
        />
      </Box>
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
          <HardWareWallet Icon={TapSigner} first />
          <HardWareWallet Icon={TapSigner} />
          <HardWareWallet Icon={TapSigner} />
          <HardWareWallet Icon={TapSigner} />
          <HardWareWallet Icon={TapSigner} />
          <HardWareWallet Icon={TapSigner} />
          <HardWareWallet Icon={TapSigner} />
          <HardWareWallet Icon={TapSigner} last />
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
});

export default HardwareWalletSetup;
