import { StyleSheet } from 'react-native';
import React, { useContext } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import DowngradeToPleb from 'src/assets/images/downgradetopleb.svg';
import DowngradeToPlebDark from 'src/assets/images/downgradetoplebDark.svg';
import Text from 'src/components/KeeperText';

function ElectrumErrorContent() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <Box width={wp(320)}>
      <Box margin={hp(5)}>
        {colorMode === 'light' ? <DowngradeToPleb /> : <DowngradeToPlebDark />}
      </Box>
      <Box>
        <Text color={`${colorMode}.greenText`} style={styles.networkText}>
          Please try again later
        </Text>
      </Box>
    </Box>
  );
}

function ElectrumDisconnectModal({ electrumErrorVisible, setElectrumErrorVisible }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <KeeperModal
      visible={electrumErrorVisible}
      close={() => setElectrumErrorVisible(false)}
      title={common.connectionError}
      subTitle={common.electrumErrorSubTitle}
      buttonText={common.continue}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      subTitleColor={`${colorMode}.secondaryText`}
      textColor={`${colorMode}.primaryText`}
      buttonTextColor={`${colorMode}.white`}
      DarkCloseIcon={colorMode === 'dark'}
      buttonCallback={() => setElectrumErrorVisible(false)}
      Content={ElectrumErrorContent}
    />
  );
}

export default ElectrumDisconnectModal;

const styles = StyleSheet.create({
  networkText: {
    fontSize: 13,
    padding: 1,
    letterSpacing: 0.65,
  },
});
