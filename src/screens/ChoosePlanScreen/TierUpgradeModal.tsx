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

export const UPGRADE_TYPE = {
  UPGRADE: 'UPGRADE',
  DOWNGRADE: 'DOWNGRADE',
  YEARLY_TO_MONTHLY: 'YEARLY_TO_MONTHLY',
  MONTHLY_TO_YEARLY: 'MONTHLY_TO_YEARLY',
};

const modalContentGenerator = (type, plan) => {
  switch (type) {
    case UPGRADE_TYPE.UPGRADE:
      return {
        title: 'Upgrade Successful',
        subTitle: `You have successfully upgraded to ${plan}`,
        isUpgrade: true,
      };
    case UPGRADE_TYPE.DOWNGRADE:
      return {
        title: 'Downgrade Successful',
        subTitle: `You have successfully downgraded to ${plan}`,
        isUpgrade: false,
      };
    case UPGRADE_TYPE.MONTHLY_TO_YEARLY:
      return {
        title: 'Payment Interval Changed Successfully',
        subTitle: `Payment interval changed from monthly to yearly. Enjoy 2 extra months of Bitcoin Keeper!`,
        isUpgrade: true,
      };
    case UPGRADE_TYPE.YEARLY_TO_MONTHLY:
      return {
        title: 'Payment Interval Changed Successfully',
        subTitle: `Payment interval changed from yearly to monthly. Pause or change subscription intervals with greater flexibility.`,
        isUpgrade: false,
      };
    default:
      return {
        title: '',
        subTitle: '',
        isUpgrade: false,
      };
  }
};

function TierUpgradeModal({
  visible,
  close,
  onPress,
  upgradeType,
  plan,
  closeOnOverlayClick = true,
}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const content = modalContentGenerator(upgradeType, plan);

  return (
    <KeeperModal
      visible={visible}
      close={close}
      showCloseIcon={false}
      title={content?.title}
      subTitle={content?.subTitle}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      textColor={`${colorMode}.textGreen`}
      subTitleColor={`${colorMode}.modalSubtitleBlack`}
      buttonText={common.Okay}
      buttonTextColor={`${colorMode}.buttonText`}
      buttonBackground={`${colorMode}.pantoneGreen`}
      buttonCallback={onPress}
      Content={() => <Content isUpgrade={content.isUpgrade} />}
      closeOnOverlayClick={closeOnOverlayClick}
    />
  );
}

export default TierUpgradeModal;
