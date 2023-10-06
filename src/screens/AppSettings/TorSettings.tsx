import Text from 'src/components/KeeperText';
import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import RestClient, { TorStatus } from 'src/services/rest/RestClient';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { setTorEnabled } from 'src/store/reducers/settings';
import { TorContext } from 'src/context/TorContext';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import KeeperModal from 'src/components/KeeperModal';
import Note from 'src/components/Note/Note';
import Buttons from 'src/components/Buttons';
import TorStatusTag from 'src/components/TorStatus';
import TorModalMap from './TorModalMap';
import OptionCard from 'src/components/OptionCard';

function TorSettings() {
  const { colorMode } = useColorMode();
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
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Tor Settings"
        subtitle="Tor improves your network privacy. To learn more visit: https://www.torproject.org/"
      />
      <ScrollView contentContainerStyle={{ paddingTop: 30, alignItems: 'center' }}>
        <Box>
          <TorStatusTag />
        </Box>
        <OptionCard
          title="Tor via Orbot"
          description="Use the Orbot app. Greater control, quicker connection and advanced options"
          callback={() => setShowOrbotTorModal(true)}
        />
        <OptionCard
          title="In-app Tor"
          description="Use direct Tor. No need to download a separate app. May be slow and unreliable"
          callback={() => setShowTorModal(true)}
        />
      </ScrollView>
      <Buttons
        primaryText="Check Status"
        primaryCallback={() => checkTorConnection()}
        primaryLoading={torStatus === TorStatus.CONNECTING || torStatus === TorStatus.CHECKING}
      />
      <Box style={styles.note}>
        <Note
          title="Note"
          subtitle="Some WiFi networks use settings that do not let your device connect to Tor. If you get constant errors, try changing to mobile network or check your network settings"
          subtitleColor="GreyText"
        />
      </Box>
      <TorModalMap visible={showTorModal} close={() => setShowTorModal(false)} />
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

const styles = StyleSheet.create({
  note: {
    marginHorizontal: '5%',
  },
});

export default TorSettings;
