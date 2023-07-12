import Text from 'src/components/KeeperText';
import { Box, HStack } from 'native-base';
import React, { useContext, useState } from 'react';

import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SettingsSwitchCard from 'src/components/SettingComponent/SettingsSwitchCard';
import { setTorEnabled } from 'src/store/reducers/settings';
import { TorContext } from 'src/store/contexts/TorContext';
import { useDispatch } from 'react-redux';
import TorModalMap from './TorModalMap';
import useToastMessage from 'src/hooks/useToastMessage';
import { ActivityIndicator } from 'react-native';

function TorSettings() {
  const { torStatus, orbotTorStatus, inAppTor, openOrbotApp } = useContext(TorContext);
  const dispatch = useDispatch();
  const [showTorModal, setShowTorModal] = useState(false);
  const { showToast } = useToastMessage();

  const handleInAppTor = () => {
    if (orbotTorStatus === TorStatus.CONNECTED || orbotTorStatus === TorStatus.CHECKING) {
      showToast('Please switch off orbot to connect to in-app tor.');
      setTimeout(() => {
        openOrbotApp(false);
      }, 3000);
      return;
    }
    if (inAppTor === TorStatus.OFF || inAppTor === TorStatus.ERROR) {
      setShowTorModal(true);
      RestClient.setUseTor(true);
      dispatch(setTorEnabled(true));
    } else {
      RestClient.setUseTor(false);
      dispatch(setTorEnabled(false));
      setShowTorModal(false);
    }
  };

  const handleOrbotTor = () => {
    if (inAppTor === TorStatus.CONNECTED || inAppTor === TorStatus.CONNECTING) {
      RestClient.setUseTor(false);
      setShowTorModal(false);
    }
    openOrbotApp(orbotTorStatus !== TorStatus.CONNECTED);
  };

  return (
    <ScreenWrapper>
      <HeaderTitle title="Tor Settings" subtitle="Tor deamon" />
      <Box paddingY="10">
        <HStack>
          {torStatus === TorStatus.CHECKING || torStatus === TorStatus.CONNECTING ? (
            <ActivityIndicator />
          ) : null}
          <Text color="light.GreyText" fontSize={12} pl={3}>
            {`Status: ${torStatus}`}
          </Text>
        </HStack>
        <SettingsSwitchCard
          title="In App Tor"
          description="Enable tor daemon"
          my={2}
          onSwitchToggle={handleInAppTor}
          loading={inAppTor === TorStatus.CONNECTING}
          value={inAppTor === TorStatus.CONNECTED}
        />
        <SettingsSwitchCard
          title="Orbot Tor"
          my={2}
          onSwitchToggle={handleOrbotTor}
          loading={orbotTorStatus === TorStatus.CHECKING}
          value={orbotTorStatus === TorStatus.CONNECTED}
        />
      </Box>
      <TorModalMap
        onPressTryAgain={handleInAppTor}
        visible={showTorModal}
        close={() => setShowTorModal(false)}
      />
    </ScreenWrapper>
  );
}

export default TorSettings;
