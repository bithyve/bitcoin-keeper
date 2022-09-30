import React from 'react';
import { Box, Text } from 'native-base';
// components and functions
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
// Asserts
import TOR from 'src/assets/images/TorAssert.svg';
import AlertIllustration from 'src/assets/images/alert_illustration.svg';
import SuccessIllustration from 'src/assets/images/success_illustration.svg';

const TorConnectionContent = () => { // assert missing
  return (
    <Box width={wp(300)}>
      <Box alignItems={'center'}>
        <TOR />
      </Box>
      <Box marginTop={hp(40)}>
        <Text
          color={'light.modalText'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={1}
          letterSpacing={0.65}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
      </Box>
    </Box>
  );
};

const TorContent = () => {
  return (
    <Box width={wp(300)}>
      <Box alignItems={'center'}>
        <TOR />
      </Box>
      <Box marginTop={hp(40)}>
        <Text
          color={'light.white1'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={1}
          letterSpacing={0.65}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
        <Text
          color={'light.white1'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={1}
          letterSpacing={0.65}
          marginTop={hp(10)}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
      </Box>
    </Box>
  );
};

const TorConnectionFailed = () => {
  return (
    <Box width={wp(270)}>
      <Box alignItems={'center'}>
        <AlertIllustration />
      </Box>
      <Box marginTop={hp(40)}>
        <Text
          color={'light.modalText'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={1}
          letterSpacing={0.65}
        >
          You will be reminded in 90 days Lorem ipsum dolor sit amet, consectetur adipiscing eli
        </Text>
      </Box>
    </Box>
  );
};

const TorEnabledContent = () => {
  return (
    <Box width={wp(270)}>
      <Box alignItems={'center'}>
        <SuccessIllustration />
      </Box>
      <Box marginTop={hp(40)}>
        <Text
          color={'light.modalText'}
          fontSize={13}
          fontFamily={'body'}
          fontWeight={'200'}
          p={1}
          letterSpacing={0.65}
        >
          You will be reminded in 90 days Lorem ipsum dolor sit amet, consectetur adipiscing eli
        </Text>
      </Box>
    </Box>
  );
};

const SettingsModalMap = ({ type, visible, close }) => {

  return (
    <>
      <KeeperModal
        visible={false}
        close={close}
        title={'Tor'}
        subTitle={'Keys Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod'}
        modalBackground={['#00836A', '#073E39']}
        buttonBackground={['#FFFFFF', '#80A8A1']}
        buttonText={'Continue'}
        buttonTextColor={'#073E39'}
        textColor={'#FFFFFF'}
        Content={TorContent}
        DarkCloseIcon={true}
      />

      <KeeperModal
        visible={false}
        close={close}
        title={'Connecting to Tor'}
        subTitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed '}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        textColor={'#041513'}
        subTitleColor={'#5F6965'}
        Content={TorConnectionContent}
      />
      <KeeperModal
        visible={false}
        close={close}
        title={'Connection Error'}
        subTitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed '}
        subTitleColor={'#5F6965'}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Try Again'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={() => { console.log('Try Again') }}
        textColor={'#041513'}
        Content={TorConnectionFailed}
      />
      <KeeperModal
        visible={false}
        close={close}
        title={'Tor Enabled Successfully!'}
        subTitle={'You will be reminded in 90 days Lorem ipsum dolor sit amet '}
        subTitleColor={'#5F6965'}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Home'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={() => { console.log('Home') }}
        textColor={'#041513'}
        Content={TorEnabledContent}
      />
    </>
  );
};

export default SettingsModalMap;

