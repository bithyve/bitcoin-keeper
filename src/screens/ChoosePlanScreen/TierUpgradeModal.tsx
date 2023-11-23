import { Box, useColorMode } from 'native-base';
import { wp } from 'src/constants/responsive';

import AlertIllustration from 'src/assets/images/upgrade-successful.svg';
import AlertIllustrationDark from 'src/assets/images/upgrade-successfulDark.svg';
import KeeperModal from 'src/components/KeeperModal';
import React from 'react';

function Content() {
  const { colorMode } = useColorMode();
  return (
    <Box width={wp(270)}>
      <Box alignItems="center">
        {colorMode === 'light' ? <AlertIllustration /> : <AlertIllustrationDark />}
      </Box>
    </Box>
  );
}

function TierUpgradeModal({
  visible,
  close,
  onPress,
  isUpgrade,
  plan,
  closeOnOverlayClick = true,
}) {
  const { colorMode } = useColorMode();
  return (
    <KeeperModal
      visible={visible}
      close={close}
      title={isUpgrade ? 'Upgrade Successful' : 'Downgrade Successful'}
      subTitle={
        isUpgrade
          ? `You have successfully upgraded to ${plan}`
          : `You have successfully downgraded to ${plan}`
      }
      modalBackground={`${colorMode}.modalWhiteBackground`}
      subTitleColor={`${colorMode}.secondaryText`}
      textColor={`${colorMode}.primaryText`}
      buttonText={'Continue'}
      buttonTextColor="light.white"
      buttonBackground={`${colorMode}.greenButtonBackground`}
      buttonCallback={onPress}
      DarkCloseIcon={colorMode === 'dark'}
      Content={() => <Content />}
      closeOnOverlayClick={closeOnOverlayClick}
    />
  );
}

export default TierUpgradeModal;
