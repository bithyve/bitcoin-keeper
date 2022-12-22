import { Box, Text, useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';

import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SettingsSwitchCard from 'src/components/SettingComponent/SettingsSwitchCard';
import { setTorEnabled } from 'src/store/reducers/settings';
import { useAppDispatch } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';

function TorSettings() {
  const { colorMode } = useColorMode();
  const [torStatus, settorStatus] = useState<TorStatus>(RestClient.getTorStatus());
  const { showToast } = useToastMessage();
  const [message, setMessage] = useState('');
  const dispatch = useAppDispatch();

  const onChangeTorStatus = (status: TorStatus, message) => {
    settorStatus(status);
    if (status === TorStatus.ERROR) {
      setMessage(message);
    } else {
      setMessage('');
    }
  };

  useEffect(() => {
    RestClient.subToTorStatus(onChangeTorStatus);
    return () => {
      RestClient.unsubscribe(onChangeTorStatus);
    };
  }, []);

  const toggleTor = () => {
    if (torStatus === TorStatus.CONNECTED) {
      RestClient.setUseTor(false);
      dispatch(setTorEnabled(false));
    } else {
      RestClient.setUseTor(true);
      showToast('Connecting to Tor');
      dispatch(setTorEnabled(true));
    }
  };

  return (
    <ScreenWrapper>
      <HeaderTitle title="Tos Settings" subtitle="Tor deamon" />
      <Box paddingY="10">
        <Text color="light.GreyText" fontSize={12} fontFamily="body" pl={10}>
          {`Status: ${torStatus}`}
        </Text>
        <Text color="light.GreyText" fontSize={11} fontFamily="body" pl={10}>
          {message}
        </Text>
        <SettingsSwitchCard
          title="Enable"
          description="Enable tor daemon"
          my={2}
          bgColor={`${colorMode}.backgroundColor2`}
          onSwitchToggle={toggleTor}
          value={torStatus === TorStatus.CONNECTED}
        />
      </Box>
    </ScreenWrapper>
  );
}

export default TorSettings;
