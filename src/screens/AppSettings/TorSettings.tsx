import Text from 'src/components/KeeperText';
import { Box, Pressable, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useEffect, useMemo, useState } from 'react';
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
import OptionCard from 'src/components/OptionCard';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import IconRefresh from 'src/assets/images/icon_refresh.svg';
import TorModalMap from './TorModalMap';

function TorSettings() {
  const { colorMode } = useColorMode();
  const { torStatus, setTorStatus, orbotTorStatus, inAppTor, openOrbotApp, checkTorConnection } =
    useContext(TorContext);
  const { translations } = useContext(LocalizationContext);
  const { settings, common } = translations;
  const dispatch = useDispatch();
  const [showTorModal, setShowTorModal] = useState(false);
  const [showOrbotTorModal, setShowOrbotTorModal] = useState(false);
  const { showToast } = useToastMessage();

  useEffect(() => {
    checkTorConnection();
  }, []);

  const getTorStatusText = useMemo(() => {
    switch (torStatus) {
      case TorStatus.OFF:
        return 'Tor Disabled';
      case TorStatus.CONNECTING:
        return 'Connecting to Tor';
      case TorStatus.CONNECTED:
        return 'Tor enabled';
      case TorStatus.ERROR:
        return 'Tor error';
      case TorStatus.CHECKING:
        return 'Checking';
      case TorStatus.CHECK_STATUS:
        return 'Check status';
      default:
        return torStatus;
    }
  }, [torStatus]);

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
      <KeeperHeader title={settings.torSettingTitle} subtitle={settings.torHeaderSubTitle} />
      <ScrollView contentContainerStyle={{ paddingTop: 30, alignItems: 'center' }}>
        {/* <Box>
          <TorStatusTag />
        </Box> */}
        <Box style={styles.torStatusContainer} backgroundColor={`${colorMode}.seashellWhite`}>
          <Box style={styles.torStatusInfo}>
            <Text style={styles.torStatusTitle} semiBold color={`${colorMode}.primaryText`}>
              {settings.CurrentStatus}
            </Text>
            <Text style={styles.torStatusText} color={`${colorMode}.primaryText`}>
              {getTorStatusText}
            </Text>
          </Box>
          <Pressable style={styles.torStatusButton} onPress={() => checkTorConnection()}>
            <IconRefresh />
            <Text style={styles.checkStatusBtnTitle} semiBold color={`${colorMode}.BrownNeedHelp`}>
              &nbsp;&nbsp;{settings.checkStatus}
            </Text>
          </Pressable>
        </Box>
        <OptionCard
          title={settings.torViaOrbot}
          description={settings.torViaOrbotSubTitle}
          callback={() => setShowOrbotTorModal(true)}
        />
        <OptionCard
          title={settings.inAppTor}
          description={settings.inAppTorSubTitle}
          callback={() => setShowTorModal(true)}
        />
      </ScrollView>
      <Box style={styles.note}>
        <Note
          title={common.note}
          subtitle={settings.torSettingsNoteSubTitle}
          subtitleColor="GreyText"
        />
      </Box>
      <TorModalMap visible={showTorModal} close={() => setShowTorModal(false)} />
      <KeeperModal
        visible={showOrbotTorModal}
        close={() => {
          setShowOrbotTorModal(false);
        }}
        title={settings.orbotConnection}
        subTitle={settings.orbotConnectionSubTitle}
        buttonText={common.connect}
        buttonCallback={handleOrbotTor}
        Content={() => (
          <Box alignItems="center">
            <Box marginTop={2}>
              <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65}>
                {
                  '\u2022 This will redirect you to the Orbot app and you can configure the connection from there.'
                }
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
  torStatusContainer: {
    flexDirection: 'row',
    padding: 15,
    width: '95%',
    margin: 15,
    borderRadius: 10,
  },
  torStatusInfo: {
    width: '60%',
  },
  torStatusTitle: {
    fontSize: 10,
  },
  torStatusText: {
    fontSize: 13,
  },
  torStatusButton: {
    flexDirection: 'row',
    width: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkStatusBtnTitle: {
    fontSize: 13,
  },
});

export default TorSettings;
