import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import AlertIllustration from 'src/assets/images/upgrade-successful.svg';
import KeeperModal from 'src/components/KeeperModal';
import React from 'react';

function Content({ isUpgrade }) {
  return (
    <Box width={wp(270)}>
      <Box alignItems="center">
        <AlertIllustration />
      </Box>
      <Box marginTop={hp(40)}>
        <Text color="light.greenText" fontSize={11} padding={1} letterSpacing={0.65}>
          {isUpgrade
            ? `To use the vault, add signing devices`
            : 'To use the vault, remove signing devices'}
        </Text>
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
      subTitleColor="light.secondaryText"
      buttonText={isUpgrade ? 'Add now' : 'Remove now'}
      buttonTextColor="light.white"
      buttonCallback={onPress}
      textColor="light.primaryText"
      Content={() => <Content isUpgrade={isUpgrade} />}
      closeOnOverlayClick={closeOnOverlayClick}
    />
  );
}

export default TierUpgradeModal;
