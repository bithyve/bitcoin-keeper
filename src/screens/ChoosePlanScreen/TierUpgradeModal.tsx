import { Box, useColorMode } from 'native-base';
import UpgradeLightIllustration from 'src/assets/images/upgrade-illustration.svg';
import DowngradeLightIllustration from 'src/assets/images/downgrade-illustration.svg';
import UpgradeDarkIllustration from 'src/assets/images/upgrade-dark-illustration.svg';
import DowngradeDarkIllustration from 'src/assets/images/downgrade-dark-illustration.svg.svg';

import KeeperModal from 'src/components/KeeperModal';
import React, { useContext } from 'react';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function Content({ isUpgrade }) {
  const { colorMode } = useColorMode();

  const UpgradeIllustration =
    colorMode === 'dark' ? UpgradeDarkIllustration : UpgradeLightIllustration;
  const DowngradeIllustration =
    colorMode === 'dark' ? DowngradeDarkIllustration : DowngradeLightIllustration;

  return (
    <Box width="100%">
      <Box alignItems="center">
        {isUpgrade ? <UpgradeIllustration /> : <DowngradeIllustration />}
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
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <KeeperModal
      visible={visible}
      close={close}
      showCloseIcon={false}
      title={isUpgrade ? 'Upgrade Successful' : 'Downgrade Successful'}
      subTitle={
        isUpgrade
          ? `You have successfully upgraded to ${plan}`
          : `You have successfully downgraded to ${plan}`
      }
      modalBackground={`${colorMode}.modalWhiteBackground`}
      subTitleColor={`${colorMode}.secondaryText`}
      textColor={`${colorMode}.primaryText`}
      buttonText={common.Okay}
      buttonTextColor={`${colorMode}.white`}
      buttonBackground={`${colorMode}.greenButtonBackground`}
      buttonCallback={onPress}
      Content={() => <Content isUpgrade={isUpgrade} />}
      closeOnOverlayClick={closeOnOverlayClick}
    />
  );
}

export default TierUpgradeModal;
