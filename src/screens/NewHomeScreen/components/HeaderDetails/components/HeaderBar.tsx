import React, { useContext, useEffect, useMemo, useState } from 'react';
import { InteractionManager, StyleSheet, TouchableOpacity } from 'react-native';
import { Box } from 'native-base';
import Text from 'src/components/KeeperText';
import IconSettings from 'src/assets/images/new_icon_settings.svg';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import { identifyUser } from 'src/core/services/sentry';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { hp } from 'src/common/data/responsiveness/responsive';

function HeaderBar() {
  const [torStatus, settorStatus] = useState<TorStatus>(RestClient.getTorStatus());
  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  const onChangeTorStatus = (status: TorStatus) => {
    settorStatus(status);
  };

  const navigation = useNavigation();

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      RestClient.subToTorStatus(onChangeTorStatus);
      identifyUser(keeper.publicId);
    });
    return () => {
      RestClient.unsubscribe(onChangeTorStatus);
    };
  }, []);

  const getTorStatusText = useMemo(() => {
    switch (torStatus) {
      case TorStatus.OFF:
        return 'Tor disabled';
      case TorStatus.CONNECTING:
        return 'Connecting to Tor';
      case TorStatus.CONNECTED:
        return 'Tor enabled';
      case TorStatus.ERROR:
        return 'Tor error';
      default:
        return torStatus;
    }
  }, [torStatus]);

  const getTorStatusColor = useMemo(() => {
    switch (torStatus) {
      case TorStatus.OFF:
        return 'light.lightAccent';
      case TorStatus.CONNECTING:
        return 'light.lightAccent';
      case TorStatus.CONNECTED:
        return '#c6ecae';
      case TorStatus.ERROR:
        return 'red.400';
      default:
        return 'light.lightAccent';
    }
  }, [torStatus]);
  return (
    <Box style={styles.wrapper}>
      <Box style={styles.torStatusWrapper} testID='view_homeTorStatus'>
        {getTorStatusText !== 'Tor disabled' && (
          <Box backgroundColor={getTorStatusColor} borderRadius={10} px={1}>
            <Text color="light.primaryText" style={styles.torText} bold>
              {getTorStatusText}
            </Text>
          </Box>
        )}
      </Box>
      <TouchableOpacity
        style={styles.settingIconWrapper}
        onPress={() => navigation.dispatch(CommonActions.navigate('AppSettings'))}
        testID='btn_AppSettingsIcon'
      >
        <IconSettings />
      </TouchableOpacity>
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingTop: hp(20)
  },
  torStatusWrapper: {
    width: '60%',
    alignItems: 'flex-end',
  },
  torStatusView: {
    backgroundColor: '#BFA8A3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  torStatusText: {
    fontSize: 12,
  },
  settingIconWrapper: {
    width: '40%',
    alignItems: 'flex-end',
  },
  torText: {
    letterSpacing: 0.75,
    fontSize: 11,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
export default HeaderBar;
