import { StyleSheet } from 'react-native';
import React, { useContext, useMemo } from 'react';
import { Box } from 'native-base';
import { TorStatus } from 'src/core/services/rest/RestClient';
import { TorContext } from 'src/context/TorContext';
import Text from './KeeperText';

function TorStatusTag() {
  const { torStatus } = useContext(TorContext);

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
      case TorStatus.CHECKING:
        return 'Checking';
      case TorStatus.CHECK_STATUS:
        return 'Check status';
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
      case TorStatus.CHECKING:
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
    <Box style={styles.torStatusWrapper} testID="view_homeTorStatus">
      <Box backgroundColor={getTorStatusColor} borderRadius={10} px={2}>
        <Text color="light.primaryText" style={styles.torText} bold>
          {getTorStatusText}
        </Text>
      </Box>
    </Box>
  );
}

export default TorStatusTag;

const styles = StyleSheet.create({
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
  torText: {
    letterSpacing: 0.75,
    fontSize: 11,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
