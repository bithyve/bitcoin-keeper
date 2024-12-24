import React, { useState } from 'react';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/constants/responsive';
import AlertIllustration from 'src/assets/images/alert_illustration.svg';
import { TorStatus } from 'src/services/rest/RestClient';
import LoadingAnimation from 'src/components/Loader';

function TorConnectionContent() {
  const { colorMode } = useColorMode();
  // assert missing
  return (
    <Box width={wp(300)}>
      <Box alignItems="center">
        <LoadingAnimation />
      </Box>
      <Box marginTop={hp(40)}>
        <Text color={`${colorMode}.greenText`} fontSize={14} padding={1} letterSpacing={0.65}>
          Connecting via Tor improves your online privacy
        </Text>
      </Box>
    </Box>
  );
}

function TorConnectionFailed() {
  const { colorMode } = useColorMode();
  return (
    <Box width={wp(270)}>
      <Box alignItems="center">
        <AlertIllustration />
      </Box>
      <Box marginTop={hp(40)}>
        <Text color={`${colorMode}.greenText`} fontSize={14} padding={1} letterSpacing={0.65}>
          This can be due to network or other conditions.
        </Text>
      </Box>
    </Box>
  );
}

function TorModalMap({ visible, close }) {
  const { colorMode } = useColorMode();
  const [torStatus] = useState<TorStatus>(TorStatus.CONNECTING);

  return (
    <>
      <KeeperModal
        visible={visible && torStatus === TorStatus.CONNECTING}
        close={close}
        title="Connecting to Tor"
        subTitle="Network calls and some functions may work slower when enabled"
        textColor={`${colorMode}.primaryText`}
        subTitleColor={`${colorMode}.secondaryText`}
        Content={TorConnectionContent}
      />
      <KeeperModal
        visible={visible && torStatus === TorStatus.ERROR}
        close={close}
        title="Connection Error"
        subTitle="There was an error when connecting via Tor. You could continue without connecting to Tor or try after sometime."
        subTitleColor={`${colorMode}.secondaryText`}
        buttonText="Close"
        buttonTextColor={`${colorMode}.buttonText`}
        buttonCallback={() => {
          close();
        }}
        textColor={`${colorMode}.primaryText`}
        Content={TorConnectionFailed}
      />
    </>
  );
}

export default TorModalMap;
