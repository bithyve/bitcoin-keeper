import React, { useState } from 'react';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/constants/responsive';
import AlertIllustration from 'src/assets/images/alert_illustration.svg';
import { TorStatus } from 'src/services/rest/RestClient';
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

function TorModalMap({ visible, close }) {
  const [torStatus, settorStatus] = useState<TorStatus>(TorStatus.CONNECTING);

  if (visible) {
    setTimeout(() => {
      settorStatus(TorStatus.ERROR);
    }, 5000);
  }

  return (
    <>
      <KeeperModal
        visible={visible && torStatus === TorStatus.CONNECTING}
        close={close}
        title="Connecting to Tor"
        subTitle="Network calls and some function may work slower when enabled"
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
          close();
        }}
        textColor="light.primaryText"
        Content={TorConnectionFailed}
      />
    </>
  );
}

export default TorModalMap;
