import React, { useContext, useState } from 'react';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/constants/responsive';
import AlertIllustration from 'src/assets/images/alert_illustration.svg';
import { TorStatus } from 'src/services/rest/RestClient';
import LoadingAnimation from 'src/components/Loader';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function TorConnectionContent() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  // assert missing
  return (
    <Box width={wp(300)}>
      <Box alignItems="center">
        <LoadingAnimation />
      </Box>
      <Box marginTop={hp(40)}>
        <Text color={`${colorMode}.greenText`} fontSize={14} padding={1} letterSpacing={0.65}>
          {wallet.connectingViaTor}
        </Text>
      </Box>
    </Box>
  );
}

function TorConnectionFailed() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  return (
    <Box width={wp(270)}>
      <Box alignItems="center">
        <AlertIllustration />
      </Box>
      <Box marginTop={hp(40)}>
        <Text color={`${colorMode}.greenText`} fontSize={14} padding={1} letterSpacing={0.65}>
          {wallet.networkOrOtherConditions}
        </Text>
      </Box>
    </Box>
  );
}

function TorModalMap({ visible, close }) {
  const { colorMode } = useColorMode();
  const [torStatus] = useState<TorStatus>(TorStatus.CONNECTING);
  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;

  return (
    <>
      <KeeperModal
        visible={visible && torStatus === TorStatus.CONNECTING}
        close={close}
        title={wallet.connectingToTor}
        subTitle={wallet.connectingToTorDesc}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={TorConnectionContent}
      />
      <KeeperModal
        visible={visible && torStatus === TorStatus.ERROR}
        close={close}
        title={wallet.connectionError}
        subTitle={wallet.connectionErrorDesc}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonText={common.close}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonCallback={() => {
          close();
        }}
        Content={TorConnectionFailed}
      />
    </>
  );
}

export default TorModalMap;
