import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';

import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { setTorEnabled } from 'src/store/reducers/settings';
import { TorContext } from 'src/store/contexts/TorContext';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import SettingsCard from 'src/components/SettingComponent/SettingsCard';
import KeeperModal from 'src/components/KeeperModal';
import Note from 'src/components/Note/Note';
import { ScaledSheet } from 'react-native-size-matters';
import { hp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import TorStatusTag from 'src/components/TorStatus';
import TorModalMap from './TorModalMap';

function TorSettings() {
  const { torStatus, setTorStatus, orbotTorStatus, inAppTor, openOrbotApp, checkTorConnection } =
    useContext(TorContext);
  const dispatch = useDispatch();
  const [showTorModal, setShowTorModal] = useState(false);
  const [showOrbotTorModal, setShowOrbotTorModal] = useState(false);
  const { showToast } = useToastMessage();

  useEffect(() => {
    checkTorConnection();
  }, []);

  const handleInAppTor = () => {
    if (orbotTorStatus === TorStatus.CONNECTED || orbotTorStatus === TorStatus.CHECKING) {
      showToast('Please switch off orbot to connect to in-app tor.');
      setTimeout(() => {
        openOrbotApp();
        setTorStatus(TorStatus.CHECK_STATUS);
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
    setShowOrbotTorModal(false);
    if (inAppTor === TorStatus.CONNECTED || inAppTor === TorStatus.CONNECTING) {
      RestClient.setUseTor(false);
      setShowTorModal(false);
    }
    openOrbotApp();
    setTorStatus(TorStatus.CHECK_STATUS);
  };

  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Tor Settings"
        subtitle="Tor improves your network privacy. To learn more visit: https://www.torproject.org/"
      />
      <Box paddingTop={10}>
        <Box>
          <TorStatusTag />
        </Box>
        <SettingsCard
          title="In-app Tor"
          description="Use direct Tor. No need to download a separate app. May be slow and unreliable"
          my={2}
          onPress={handleInAppTor}
          loading={inAppTor === TorStatus.CONNECTING}
          value={inAppTor === TorStatus.CONNECTED}
          on
        />
        <SettingsCard
          title="Tor via Orbot"
          description="Use the Orbot app. Greater control, quicker connection and advanced options"
          my={2}
          loading={orbotTorStatus === TorStatus.CHECKING}
          value={orbotTorStatus === TorStatus.CONNECTED}
          onPress={() => setShowOrbotTorModal(true)}
        />
        <Buttons
          primaryText="Check Status"
          primaryCallback={() => checkTorConnection()}
          primaryLoading={torStatus === TorStatus.CONNECTING || torStatus === TorStatus.CHECKING}
        />
      </Box>
      <Box style={styles.note}>
        <Note
          title="Note"
          subtitle="Some WiFi networks use settings that do not let your device connect to Tor. If you get constant errors, try changing to mobile network or check your network settings"
        />
      </Box>
      <TorModalMap
        onPressTryAgain={handleInAppTor}
        visible={showTorModal}
        close={() => setShowTorModal(false)}
      />
      <KeeperModal
        visible={showOrbotTorModal}
        close={() => {
          setShowOrbotTorModal(false);
        }}
        title="Orbot Connection"
        subTitle="To connect to Tor via Orbot, you need to have the Orbot app installed on your device."
        buttonText="Connect"
        buttonCallback={handleOrbotTor}
        Content={() => (
          <Box alignItems="center">
            <Box marginTop={2}>
              <Text color="light.greenText" fontSize={13} letterSpacing={0.65}>
                {`\u2022 This will redirect you to the Orbot app and you can configure the connection from there.`}
              </Text>
            </Box>
          </Box>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = ScaledSheet.create({
  note: {
    position: 'absolute',
    bottom: hp(35),
    marginLeft: 26,
    width: '90%',
    paddingTop: hp(10),
  },
});

export default TorSettings;
