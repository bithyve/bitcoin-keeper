import { Box, Text } from 'native-base';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import AlertIllustration from 'src/assets/images/upgrade-successful.svg';
import KeeperModal from 'src/components/KeeperModal';
import React from 'react';

const Content = ({ isUpgrade }) => {
  return (
    <Box width={wp(270)}>
      <Box alignItems={'center'}>
        <AlertIllustration />
      </Box>
      <Box marginTop={hp(40)}>
        <Text
          color={'light.modalText'}
          fontSize={11}
          fontFamily={'body'}
          fontWeight={'200'}
          p={1}
          letterSpacing={0.65}
        >
          {isUpgrade
            ? `To use the vault, add signing devices`
            : 'To use the vault, remove signing devices'}
        </Text>
      </Box>
    </Box>
  );
};

const TierUpgradeModal = ({ visible, close, onPress, isUpgrade, plan }) => {
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
      subTitleColor={'#5F6965'}
      modalBackground={['#F7F2EC', '#F7F2EC']}
      buttonBackground={['#00836A', '#073E39']}
      buttonText={isUpgrade ? 'Add now' : 'Remove now'}
      buttonTextColor={'#FAFAFA'}
      buttonCallback={onPress}
      textColor={'#041513'}
      Content={() => <Content isUpgrade={isUpgrade} />}
    />
  );
};

export default TierUpgradeModal;
