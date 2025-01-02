import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import ConnectIcon from 'src/assets/images/connectNode.svg';
import ConnectIconWhite from 'src/assets/images/connectNodeWhite.svg';
import DisconnectIcon from 'src/assets/images/disconnectNode.svg';
import DisconnectIconWhite from 'src/assets/images/disconnectNodeWhite.svg';
import DeleteIcon from 'src/assets/images/deleteNode.svg';
import DeleteIconWhite from 'src/assets/images/deleteNodeWhite.svg';
import Colors from 'src/theme/Colors';
import Node from 'src/services/electrum/node';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const ServerItem = ({
  item,
  onDelete,
  onConnectToNode,
  setNodeToDelete,
  setNodeToDisconnect,
  setElectrumDisconnectWarningVisible,
}) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const isConnected = Node.nodeConnectionStatus(item);

  return (
    <Box
      backgroundColor={`${colorMode}.boxSecondaryBackground`}
      style={[styles.nodeList]}
      borderColor={colorMode === 'light' ? 'transparent' : Colors.separator}
    >
      <Box style={styles.nodeDetail}>
        <Box flex={1}>
          <Text color={`${colorMode}.secondaryText`} style={[styles.nodeTextHeader]} medium>
            {settings.host}
          </Text>
          <Text numberOfLines={1} style={styles.nodeTextValue}>
            {item.host}
          </Text>
        </Box>
        <Box flex={-1}>
          <Text color={`${colorMode}.secondaryText`} style={[styles.nodeTextHeader]} medium>
            {settings.portNumber}
          </Text>
          <Text style={styles.nodeTextValue}>{item.port}</Text>
        </Box>
      </Box>
      <Box style={styles.nodeButtons} borderColor={`${colorMode}.greyBorder`}>
        <TouchableOpacity
          testID="btn_deleteNode"
          onPress={() => {
            if (!isConnected) onDelete(item);
            else {
              setNodeToDelete(item);
              setElectrumDisconnectWarningVisible(true);
            }
          }}
        >
          <Box style={[styles.actionArea, { width: wp(70), marginRight: wp(20) }]}>
            {colorMode === 'light' ? <DeleteIcon /> : <DeleteIconWhite />}
            <Text style={[styles.actionText, { paddingTop: 1 }]}>{common.delete}</Text>
          </Box>
        </TouchableOpacity>
        <TouchableOpacity
          testID="btn_disconnetNode"
          onPress={async () => {
            if (!isConnected) await onConnectToNode(item);
            else {
              setNodeToDisconnect(item);
              setElectrumDisconnectWarningVisible(true);
            }
          }}
        >
          <Box
            style={[
              styles.actionArea,
              {
                paddingTop: isConnected ? hp(6) : hp(6),
              },
            ]}
          >
            {isConnected ? (
              colorMode === 'light' ? (
                <DisconnectIcon />
              ) : (
                <DisconnectIconWhite />
              )
            ) : colorMode === 'light' ? (
              <ConnectIcon />
            ) : (
              <ConnectIconWhite />
            )}
            <Text
              color={`${colorMode}.noteTextClosed`}
              style={[styles.actionText, { paddingTop: isConnected ? 0 : 1 }]}
            >
              {isConnected ? common.disconnect : common.connect}
            </Text>
          </Box>
        </TouchableOpacity>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  nodeList: {
    width: '100%',
    borderRadius: 7,
    paddingHorizontal: wp(14),
    paddingTop: hp(20),
    paddingBottom: hp(18),
    marginBottom: hp(10),
    borderWidth: 1,
  },
  nodeDetail: {
    overflow: 'hidden',
    width: '95%',
    flexDirection: 'row',
  },
  nodeButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: hp(10),
    marginTop: hp(15),
  },
  actionArea: {
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    paddingTop: hp(4),
    marginLeft: wp(8),
  },
  nodeTextHeader: {
    marginHorizontal: 10,
    fontSize: 12,
  },
  nodeTextValue: {
    fontSize: 12,
    marginLeft: 10,
    paddingBottom: 2,
  },
});

export default ServerItem;
