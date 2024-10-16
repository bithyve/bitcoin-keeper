import React, { useContext } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { Box, useColorMode } from 'native-base';
import { wp } from 'src/constants/responsive';
import DowngradeToPleb from 'src/assets/images/downgradetopleb.svg';
import DowngradeToPlebDark from 'src/assets/images/downgradetoplebDark.svg';
import ElectrumClient from 'src/services/electrum/client';

function ElectrumErrorContent() {
  const { colorMode } = useColorMode();

  return (
    <Box width="100%" alignItems="center" justifyContent="center">
      <Box marginRight={wp(30)}>
        {colorMode === 'light' ? <DowngradeToPleb /> : <DowngradeToPlebDark />}
      </Box>
    </Box>
  );
}

function ElectrumDisconnectModal({ navigation, electrumErrorVisible, setElectrumErrorVisible }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return (
    <KeeperModal
      visible={electrumErrorVisible}
      close={() => setElectrumErrorVisible(false)}
      title={
        !ElectrumClient.getActivePeer()
          ? common.noElectrumServerTitle
          : common.electrumServerConnectionFailedTitle
      }
      subTitle={
        !ElectrumClient.getActivePeer()
          ? common.noElectrumServerText
          : common.electrumServerConnectionFailedText
      }
      buttonText={common.continue}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      subTitleColor={`${colorMode}.secondaryText`}
      textColor={`${colorMode}.primaryText`}
      buttonTextColor={`${colorMode}.white`}
      DarkCloseIcon={colorMode === 'dark'}
      buttonCallback={() => setElectrumErrorVisible(false)}
      secondaryButtonText={common.serverSettings}
      secondaryCallback={() => {
        setElectrumErrorVisible(false);
        navigation.navigate('NodeSettings');
      }}
      Content={ElectrumErrorContent}
    />
  );
}

export default ElectrumDisconnectModal;
