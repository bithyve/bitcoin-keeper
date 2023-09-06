import React, { useState, useEffect } from 'react';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';

// components and functions
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/constants/responsive';
// Asserts
import TOR from 'src/assets/images/TorAssert.svg';
import AlertIllustration from 'src/assets/images/alert_illustration.svg';
import SuccessIllustration from 'src/assets/images/success_illustration.svg';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import LoadingAnimation from 'src/components/Loader';

function TorConnectionContent() {
  // assert missing
  return (
    <Box width={wp(300)}>
      <Box alignItems="center">
        <LoadingAnimation />
      </Box>
      <Box marginTop={hp(40)}>
        <Text color="light.greenText" fontSize={13} padding={1} letterSpacing={0.65}>
          Connecting via Tor improves your online privacy
        </Text>
      </Box>
    </Box>
  );
}

function TorContent() {
  return (
    <Box width={wp(300)}>
      <Box alignItems="center">
        <TOR />
      </Box>
      <Box marginTop={hp(40)}>
        <Text color="light.white" fontSize={13} padding={1} letterSpacing={0.65}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua.
        </Text>
        <Text color="light.white" fontSize={13} padding={1} letterSpacing={0.65} marginTop={hp(10)}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua.
        </Text>
      </Box>
    </Box>
  );
}

function TorConnectionFailed() {
  return (
    <Box width={wp(270)}>
      <Box alignItems="center">
        <AlertIllustration />
      </Box>
      <Box marginTop={hp(40)}>
        <Text color="light.greenText" fontSize={13} padding={1} letterSpacing={0.65}>
          Could not established connection with Whirlpool client over in-app Tor. Try again later or
          use other options
        </Text>
      </Box>
    </Box>
  );
}

function TorEnabledContent() {
  return (
    <Box width={wp(270)}>
      <Box alignItems="center">
        <SuccessIllustration />
      </Box>
      <Box marginTop={hp(40)}>
        <Text color="light.greenText" fontSize={13} padding={1} letterSpacing={0.65}>
          All your backend connections will be over Tor network
        </Text>
      </Box>
    </Box>
  );
}

function TorModalMap({ visible, close, onPressTryAgain }) {
  const [torStatus, settorStatus] = useState<TorStatus>(TorStatus.CONNECTING);

  const onChangeTorStatus = (status: TorStatus) => {
    settorStatus(status);
  };

  if (visible) {
    setTimeout(() => {
      settorStatus(TorStatus.ERROR);
    }, 5000);
  }

  // useEffect(() => {
  //   RestClient.subToTorStatus(onChangeTorStatus);
  //   return () => {
  //     RestClient.unsubscribe(onChangeTorStatus);
  //   };
  // }, []);

  return (
    <>
      <KeeperModal
        visible={visible && torStatus === TorStatus.CONNECTING}
        close={close}
        title="Connecting to Tor"
        subTitle="Network calls and some functions may work slower when enabled"
        textColor="light.primaryText"
        subTitleColor="light.secondaryText"
        Content={TorConnectionContent}
      />
      <KeeperModal
        visible={visible && torStatus === TorStatus.ERROR}
        close={close}
        title="Connection Error"
        subTitle="This can be due to the network or other conditions "
        subTitleColor="light.secondaryText"
        buttonText="Close"
        buttonTextColor="light.white"
        buttonCallback={() => {
          // onPressTryAgain();
          close();
        }}
        textColor="light.primaryText"
        Content={TorConnectionFailed}
      />
      {/* <KeeperModal
        visible={visible && torStatus === TorStatus.CONNECTED}
        close={close}
        title="Tor Enabled Successfully!"
        subTitle="The app may be slower than usual over Tor"
        subTitleColor="light.secondaryText"
        buttonText="Continue"
        buttonTextColor="light.white"
        buttonCallback={close}
        textColor="light.primaryText"
        Content={TorEnabledContent}
      /> */}
    </>
  );
}

export default TorModalMap;
