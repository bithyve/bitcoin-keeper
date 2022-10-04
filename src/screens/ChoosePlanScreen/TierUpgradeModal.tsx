import React from 'react';
import { Box, Text } from 'native-base';
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import AlertIllustration from 'src/assets/images/upgrade-successful.svg';


const Content = () => {
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
        </Text>
      </Box>
    </Box>
  );
};



const TierUpgradeModal = ({ visible, close, onPress, isUpgrade }) => {

  return (
    <KeeperModal
      visible={visible}
      close={close}
      title={isUpgrade ? 'Upgrade Successful' : 'Downgrade Successful'}
      subTitle={'Ipsum amet incididunt irure Lorem fugiat tempor. Ipsum amet incididunt irure Lorem fugiat tempor. '}
      subTitleColor={'#5F6965'}
      modalBackground={['#F7F2EC', '#F7F2EC']}
      buttonBackground={['#00836A', '#073E39']}
      buttonText={isUpgrade ? 'Add Signers' : 'Remove Signers'}
      buttonTextColor={'#FAFAFA'}
      buttonCallback={onPress}
      textColor={'#041513'}
      Content={Content}
    />
  );
};

export default TierUpgradeModal;
