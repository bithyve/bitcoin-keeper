import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import AlertIllustration from 'src/assets/images/upgrade-successful.svg';
import AlertIllustrationDark from 'src/assets/images/upgrade-successfulDark.svg'
import KeeperModal from 'src/components/KeeperModal';
import React from 'react';

function Content({ isUpgrade }) {
  const { colorMode } = useColorMode();
  return (
    <Box width={wp(270)}>
      <Box alignItems="center">
        {colorMode === 'light' ? <AlertIllustration /> : <AlertIllustrationDark />}
      </Box>
      <Box marginTop={hp(40)}>
        <Text color={`${colorMode}.greenText`} fontSize={11} padding={1} letterSpacing={0.65}>
          {isUpgrade
            ? `Add signing devices to use the Vault`
            : 'Add signing devices to use the Vault'}
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
      modalBackground={[`${colorMode}.modalWhiteBackground`, `${colorMode}.modalWhiteBackground`]}
      subTitleColor={`${colorMode}.secondaryText`}
      textColor={`${colorMode}.primaryText`}
      buttonText={isUpgrade ? 'Add now' : 'Remove now'}
      buttonTextColor="light.white"
      buttonCallback={onPress}
      DarkCloseIcon={colorMode === 'dark'}
      Content={() => <Content isUpgrade={isUpgrade} />}
      closeOnOverlayClick={closeOnOverlayClick}
    />
  );
}

export default TierUpgradeModal;
