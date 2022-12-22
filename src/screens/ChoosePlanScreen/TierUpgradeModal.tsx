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
        <Text color="light.greenText" fontSize={11} fontFamily="body" p={1} letterSpacing={0.65}>
          {isUpgrade
            ? `To use the vault, add signing devices`
            : 'To use the vault, remove signing devices'}
        </Text>
      </Box>
    </Box>
  );
}

function TierUpgradeModal({ visible, close, onPress, isUpgrade, plan }) {
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
      subTitleColor="#5F6965"
      buttonBackground={['#00836A', '#073E39']}
      buttonText={isUpgrade ? 'Add now' : 'Remove now'}
      buttonTextColor="#FAFAFA"
      buttonCallback={onPress}
      textColor="#041513"
      Content={() => <Content isUpgrade={isUpgrade} />}
    />
  );
}

export default TierUpgradeModal;
