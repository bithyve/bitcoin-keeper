import React from 'react';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';

import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import Arrow from 'src/assets/images/svgs/arrow.svg';
import TapSigner from 'src/assets/images/svgs/tapsigner.svg';

const HardwareWalletSetup = ({ navigation }: { navigation }) => {

  const HardWareWallet = ({ Icon }: { Icon }) => {
    return (
      <Box>
        <Box
          justifyContent={'center'}
          alignItems={'center'}
          height={windowHeight * 0.080}
        >
          <Icon />
        </Box>
        <Box opacity={0.1} backgroundColor={'light.divider'} width={windowWidth * 0.68} height={0.5} />
      </Box>
    )
  }

  return (
    <Box
      flex={1}
      paddingX={windowWidth * 0.106}
      background={'light.ReceiveBackground'}
      marginTop={windowHeight * 0.033}
    >
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title="Setup a Hardware Wallet"
        subtitle="to activate your Vault"
        onPressHandler={() => navigation.navigate('NewHome')}
        headerColor={'light.headerTextTwo'}
        hearderMarginTop={0.032}
        marginLeft={0}
        hearderMarginLeft={0}
        color={'light.ReceiveBackground'}
      />

      <Box
        marginTop={windowHeight * 0.036}
        height={windowHeight * 0.662}
        width={windowWidth * 0.786}
        backgroundColor={'light.lightYellow'}
        borderRadius={windowHeight * 0.018}
        alignItems={'center'}
      >
        <HardWareWallet Icon={TapSigner} />
        <HardWareWallet Icon={TapSigner} />
        <HardWareWallet Icon={TapSigner} />
        <HardWareWallet Icon={TapSigner} />
        <HardWareWallet Icon={TapSigner} />
        <HardWareWallet Icon={TapSigner} />
        <HardWareWallet Icon={TapSigner} />

        <Box
          justifyContent={'center'}
          alignItems={'center'}
          height={windowHeight * 0.080}
        >
          <Text
            fontSize={RFValue(12)}
            letterSpacing={0.6}
            fontWeight={100}
            color={'light.headerTextTwo'}
            lineHeight={18}
          >
            Keeper
          </Text>
        </Box>
      </Box>

      <Box marginTop={hp(18)}>
        <Text
          fontSize={RFValue(12)}
          letterSpacing={0.6}
          fontWeight={100}
          color={'light.lightBlack'}
          width={wp(300)}
          noOfLines={3}
          lineHeight={18}
        >
          A Signer can be a hardware wallet or a signing device or an app. Most popular ones are listed above. Want support for more.{' '}
          <Text
            fontStyle={'italic'}
            fontWeight={'bold'}
          >
            Contact Us
          </Text>
        </Text>
      </Box>
    </Box>
  );
};

export default HardwareWalletSetup;
