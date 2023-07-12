import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';

import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SettingsSwitchCard from 'src/components/SettingComponent/SettingsSwitchCard';
import { setTorEnabled } from 'src/store/reducers/settings';
import { TorContext } from 'src/store/contexts/TorContext';
import { useDispatch } from 'react-redux';
import TorModalMap from './TorModalMap';

function TorSettings() {
  const { torStatus, setTorStatus, orbotTorStatus, setOrbotTorStatus, inAppTor, setInAppTor } =
    useContext(TorContext);
  const dispatch = useDispatch();
  const [showTorModal, setShowTorModal] = useState(false);

  const handleInAppTor = () => {
    setInAppTor(TorStatus.CONNECTING);
    setTorStatus(TorStatus.CONNECTING);
    if (orbotTorStatus === TorStatus.CONNECTED || orbotTorStatus === TorStatus.CONNECTING) {
      // kill orbot tor
    }
    if (torStatus === TorStatus.OFF || torStatus === TorStatus.ERROR) {
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
    if (inAppTor === TorStatus.CONNECTED || orbotTorStatus === TorStatus.CONNECTING) {
      RestClient.setUseTor(false);
    }
  };

  return (
    <ScreenWrapper>
      <HeaderTitle title="Tor Settings" subtitle="Tor deamon" />
      <Box paddingY="10">
        <Text color="light.GreyText" fontSize={12} pl={10}>
          {`Status: ${torStatus}`}
        </Text>
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
          loading={orbotTorStatus === TorStatus.CONNECTING}
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
