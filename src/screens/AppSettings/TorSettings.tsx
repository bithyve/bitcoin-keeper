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
import Instruction from 'src/components/Instruction';
import { hp, wp } from 'src/constants/responsive';

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

  useEffect(() => {
    if (inAppTor === TorStatus.CONNECTED || inAppTor === TorStatus.ERROR) {
      setShowTorModal(false);
    }
  }, [inAppTor]);

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
    if (inAppTor === TorStatus.OFF || inAppTor === TorStatus.ERROR) {
      setShowTorModal(true);
      RestClient.setUseTor(true);
      dispatch(setTorEnabled(true));
    } else if (inAppTor === TorStatus.CONNECTED || inAppTor === TorStatus.CONNECTING) {
      RestClient.setUseTor(false);
      dispatch(setTorEnabled(false));
      setShowTorModal(false);
    } else if (orbotTorStatus === TorStatus.CONNECTED || orbotTorStatus === TorStatus.CHECKING) {
      showToast('Please switch off Orbot to connect to in-app Tor.');
      setTimeout(() => {
        openOrbotApp();
        setTorStatus(TorStatus.CHECK_STATUS);
      }, 3000);
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
          title={
            inAppTor === TorStatus.CONNECTED
              ? settings.deactivateInAppTor
              : settings.activateInAppTor
          }
          description={
            inAppTor === TorStatus.CONNECTED
              ? settings.inAppTorSubTitle2
              : settings.inAppTorSubTitle
          }
          callback={() => handleInAppTor()}
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
        closeOnOverlayClick={true}
        dismissible={true}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        title={settings.orbotConnection}
        subTitle={settings.orbotConnectionSubTitle}
        showCloseIcon={false}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        buttonBackground={`${colorMode}.pantoneGreen`}
        secButtonTextColor={`${colorMode}.pantoneGreen`}
        secondaryButtonText={common.Later}
        secondaryCallback={() => setShowOrbotTorModal(false)}
        buttonText={common.connect}
        buttonCallback={handleOrbotTor}
        Content={() => (
          <Box style={styles.orbotContent}>
            <Instruction text={settings.torDescription} textWidth={wp(275)} />
          </Box>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  note: {
    marginHorizontal: '2%',
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
    fontSize: 12,
  },
  torStatusButton: {
    flexDirection: 'row',
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkStatusBtnTitle: {
    fontSize: 12,
  },
  orbotContent: {
    alignItems: 'flex-start',
    marginBottom: hp(10),
  },
});

export default TorSettings;
