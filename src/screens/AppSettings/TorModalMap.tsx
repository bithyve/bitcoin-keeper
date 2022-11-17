import React, { useState, useEffect } from 'react';
import { Box, Text } from 'native-base';

// components and functions
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
// Asserts
import TOR from 'src/assets/images/TorAssert.svg';
import AlertIllustration from 'src/assets/images/alert_illustration.svg';
import SuccessIllustration from 'src/assets/images/success_illustration.svg';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';

const TorConnectionContent = () => {
  // assert missing
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
          Connecting via Tor improves your online privacy
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua.
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua.
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
          There was an error when connecting via Tor
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
          All your backend connections will be over Tor network
        </Text>
      </Box>
    </Box>
  );
};

const TorModalMap = ({ visible, close, onPressTryAgain }) => {
  const [torStatus, settorStatus] = useState<TorStatus>(RestClient.getTorStatus());
  const [message, setMessage] = useState('');

  const onChangeTorStatus = (status: TorStatus, message) => {
    settorStatus(status);
    if (status === TorStatus.ERROR) {
      setMessage(message);
    } else {
      setMessage('');
    }
  };

  useEffect(() => {
    RestClient.subToTorStatus(onChangeTorStatus);
    return () => {
      RestClient.unsubscribe(onChangeTorStatus);
    };
  }, []);

  return (
    <>
      {/* <KeeperModal
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
      /> */}
      <KeeperModal
        visible={visible && torStatus === TorStatus.CONNECTING}
        close={close}
        title={'Connecting to Tor'}
        subTitle={'Network calls and some functions may work slower when the Tor is enabled '}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        textColor={'#041513'}
        subTitleColor={'#5F6965'}
        Content={TorConnectionContent}
      />
      <KeeperModal
        visible={visible && torStatus === TorStatus.ERROR}
        close={close}
        title={'Connection Error'}
        subTitle={'This can be due to the network or other conditions '}
        subTitleColor={'#5F6965'}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Try Again'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={() => {
          onPressTryAgain();
        }}
        textColor={'#041513'}
        Content={TorConnectionFailed}
      />
      <KeeperModal
        visible={visible && torStatus === TorStatus.CONNECTED}
        close={close}
        title={'Tor Enabled Successfully!'}
        subTitle={'The app may be slower than usual over Tor'}
        subTitleColor={'#5F6965'}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Close'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={close}
        textColor={'#041513'}
        Content={TorEnabledContent}
      />
    </>
  );
};

export default TorModalMap;
