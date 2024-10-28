import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, Modal } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useAppDispatch } from 'src/store/hooks';
import { NodeDetail } from 'src/services/wallets/interfaces';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import ConnectIcon from 'src/assets/images/connectNode.svg';
import ConnectIconWhite from 'src/assets/images/connectNodeWhite.svg';
import DisconnectIcon from 'src/assets/images/disconnectNode.svg';
import DisconnectIconWhite from 'src/assets/images/disconnectNodeWhite.svg';
import DeleteIcon from 'src/assets/images/deleteNode.svg';
import DeleteIconWhite from 'src/assets/images/deleteNodeWhite.svg';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Text from 'src/components/KeeperText';
import {
  electrumClientConnectionExecuted,
  electrumClientConnectionInitiated,
} from 'src/store/reducers/login';
import Node from 'src/services/electrum/node';
import AddNode from './AddNodeModal';
import TickIcon from 'src/assets/images/icon_tick.svg';
import DowngradeToPleb from 'src/assets/images/downgradetopleb.svg';
import DowngradeToPlebDark from 'src/assets/images/downgradetoplebDark.svg';
import Buttons from 'src/components/Buttons';
import EmptyListIllustration from 'src/components/EmptyListIllustration';
import Colors from 'src/theme/Colors';

function ElectrumDisconnectWarningContent() {
  const { colorMode } = useColorMode();

  return (
    <Box width="100%" alignItems="center" justifyContent="center">
      <Box marginRight={wp(30)}>
        {colorMode === 'light' ? <DowngradeToPleb /> : <DowngradeToPlebDark />}
      </Box>
    </Box>
  );
}

function NodeSettings() {
  const { colorMode } = useColorMode();
  const dispatch = useAppDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { settings } = translations;
  const { showToast } = useToastMessage();

  const [nodeList, setNodeList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [currentlySelectedNode, setCurrentlySelectedNodeItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [electrumDisconnectWarningVisible, setElectrumDisconnectWarningVisible] = useState(false);
  const [nodeToDisconnect, setNodeToDisconnect] = useState(null);
  const [nodeToDelete, setNodeToDelete] = useState(null);

  useEffect(() => {
    const nodes: NodeDetail[] = Node.getAllNodes();
    const current = nodes.filter((node) => Node.nodeConnectionStatus(node))[0];
    setCurrentlySelectedNodeItem(current);
    setNodeList(nodes);
  }, []);

  const openAddNodeModal = () => {
    setVisible(true);
  };

  const closeAddNodeModal = async () => {
    setVisible(false);
  };

  const onSaveCallback = async (nodeDetail: NodeDetail) => {
    setLoading(true);
    await closeAddNodeModal();

    // Sanitize host
    if (nodeDetail.host.endsWith('/')) {
      nodeDetail.host = nodeDetail.host.slice(0, -1);
    }

    if (nodeDetail.host.startsWith('http://')) {
      nodeDetail.host = nodeDetail.host.replace('http://', '');
    } else if (nodeDetail.host.startsWith('https://')) {
      nodeDetail.host = nodeDetail.host.replace('https://', '');
    }

    const { saved } = await Node.save(nodeDetail, nodeList);
    if (saved) {
      const updatedNodeList = Node.getAllNodes();
      setNodeList(updatedNodeList);
      const newNode = updatedNodeList.find(
        (node) => node.host === nodeDetail.host && node.port === nodeDetail.port
      );
      if (newNode) {
        onConnectToNode(newNode);
      }
    } else {
      showToast(`Failed to save, unable to connect to: ${nodeDetail.host} `, <ToastErrorIcon />);
    }
    setLoading(false);
  };

  const onAdd = () => {
    setCurrentlySelectedNodeItem(null);
    openAddNodeModal();
  };

  const onDelete = async (selectedItem: NodeDetail) => {
    const isConnected = Node.nodeConnectionStatus(selectedItem);
    if (isConnected) await Node.disconnect(selectedItem);

    const status = Node.delete(selectedItem);
    // dispatch(updateAppImage(null));
    let nodes = [];
    if (status) {
      nodes = Node.getAllNodes();
      setNodeList(nodes);
    }

    setCurrentlySelectedNodeItem(null);
  };

  const onConnectToNode = async (selectedNode: NodeDetail) => {
    let nodes = Node.getAllNodes();
    if (
      currentlySelectedNode &&
      selectedNode.id !== currentlySelectedNode.id &&
      currentlySelectedNode.isConnected
    ) {
      // disconnect currently selected node(if connected)
      await Node.disconnect(currentlySelectedNode);
      currentlySelectedNode.isConnected = false;
      Node.update(currentlySelectedNode, { isConnected: currentlySelectedNode.isConnected });

      nodes = nodes.map((item) => {
        if (item.id === currentlySelectedNode.id) return { ...currentlySelectedNode };
        return item;
      });

      setCurrentlySelectedNodeItem(null);
    }

    dispatch(electrumClientConnectionInitiated());
    setLoading(true);

    const node = { ...selectedNode };
    const { connected, connectedTo, error } = await Node.connectToSelectedNode(node);

    if (connected) {
      node.isConnected = connected;
      Node.update(node, { isConnected: connected });
      dispatch(electrumClientConnectionExecuted({ successful: node.isConnected, connectedTo }));
      showToast(`Connected to: ${connectedTo}`, <TickIcon />);
      nodes = nodes.map((item) => {
        if (item.id === node.id) return { ...node };
        return item;
      });
    } else dispatch(electrumClientConnectionExecuted({ successful: node.isConnected, error }));

    setCurrentlySelectedNodeItem(node);
    setNodeList(nodes);
    setLoading(false);
  };

  const onDisconnectToNode = async (selectedNode: NodeDetail) => {
    try {
      let nodes = [...nodeList];
      setLoading(true);
      const node = { ...selectedNode };
      Node.disconnect(node);
      node.isConnected = false;
      Node.update(node, { isConnected: node.isConnected });
      showToast(`Disconnected from ${node.host}`, <ToastErrorIcon />);
      nodes = nodes.map((item) => {
        if (item.id === node.id) return { ...node };
        return item;
      });
      setNodeList(nodes);
      setCurrentlySelectedNodeItem(null);
      setLoading(false);
    } catch (error) {
      console.log('Error disconnecting electrum client', error);
      showToast(`Failed to disconnect from Electrum server`, <ToastErrorIcon />);
    }
  };

  const onSelectedNodeitem = (selectedItem: NodeDetail) => {
    setCurrentlySelectedNodeItem(selectedItem);
  };
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`} barStyle="dark-content">
      <KeeperHeader
        title={settings.nodeSettings}
        subtitle={settings.manageElectrumServersSubtitle}
      />
      <Box style={styles.nodesListWrapper}>
        {nodeList.length > 0 ? (
          <FlatList
            data={nodeList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isConnected = Node.nodeConnectionStatus(item);
              return (
                <TouchableOpacity
                  onPress={() => onSelectedNodeitem(item)}
                  style={item.id === currentlySelectedNode?.id ? styles.selectedItem : null}
                >
                  <Box
                    backgroundColor={`${colorMode}.seashellWhite`}
                    style={[styles.nodeList]}
                    borderColor={colorMode === 'light' ? 'transparent' : Colors.separator}
                  >
                    <Box style={styles.nodeDetail} backgroundColor={`${colorMode}.seashellWhite`}>
                      <Box flex={1}>
                        <Text
                          color={`${colorMode}.secondaryText`}
                          style={[styles.nodeTextHeader]}
                          medium
                        >
                          {settings.host}
                        </Text>
                        <Text numberOfLines={1} style={styles.nodeTextValue}>
                          {item.host}
                        </Text>
                      </Box>
                      <Box flex={-1}>
                        <Text
                          color={`${colorMode}.secondaryText`}
                          style={[styles.nodeTextHeader]}
                          medium
                        >
                          {settings.portNumber}
                        </Text>
                        <Text style={styles.nodeTextValue}>{item.port}</Text>
                      </Box>
                    </Box>
                    <Box
                      style={styles.nodeButtons}
                      borderColor={`${colorMode}.greyBorder`}
                      backgroundColor={`${colorMode}.seashellWhite`}
                    >
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
                          <Text style={[styles.actionText, { paddingTop: 1 }]}>
                            {common.delete}
                          </Text>
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
                          <Text style={[styles.actionText, { paddingTop: isConnected ? 0 : 1 }]}>
                            {isConnected ? common.disconnect : common.connect}
                          </Text>
                        </Box>
                      </TouchableOpacity>
                    </Box>
                  </Box>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <Box flex={1}>
            <EmptyListIllustration listType="nodes" />
          </Box>
        )}
      </Box>
      <Box>
        <Buttons primaryCallback={onAdd} primaryText={`+ ${settings.addNewNode}`} fullWidth />
      </Box>
      <KeeperModal
        justifyContent="center"
        visible={visible}
        close={closeAddNodeModal}
        title={settings.nodeDetailsTitle}
        subTitle={settings.nodeDetailsSubtitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        buttonBackground={`${colorMode}.gradientStart`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonText=""
        buttonTextColor={`${colorMode}.buttonText`}
        buttonCallback={closeAddNodeModal}
        closeOnOverlayClick={false}
        Content={() => AddNode(Node.getModalParams(currentlySelectedNode), onSaveCallback)}
      />
      <KeeperModal
        visible={electrumDisconnectWarningVisible}
        close={() => {
          setNodeToDisconnect(null);
          setNodeToDelete(null);
          setElectrumDisconnectWarningVisible(false);
        }}
        title={common.disconnectingFromServer}
        subTitle={common.disconnectingFromServerText}
        buttonText={common.disconnect}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonCallback={async () => {
          setElectrumDisconnectWarningVisible(false);
          if (nodeToDisconnect) {
            await onDisconnectToNode(nodeToDisconnect);
            setNodeToDisconnect(null);
          } else if (nodeToDelete) {
            await onDelete(nodeToDelete);
            setNodeToDelete(null);
          }
        }}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setElectrumDisconnectWarningVisible(false)}
        Content={ElectrumDisconnectWarningContent}
      />
      <Modal animationType="none" transparent visible={loading} onRequestClose={() => {}}>
        <View style={styles.activityIndicator}>
          <ActivityIndicator color="#017963" size="large" />
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  appSettingTitle: {
    fontSize: 18,
    letterSpacing: 1.2,
    paddingBottom: 5,
  },
  appSettingSubTitle: {
    fontSize: 12,
    letterSpacing: 0.6,
  },
  connectToMyNodeTitle: {
    fontSize: 14,
    letterSpacing: 1.12,
    paddingBottom: 5,
  },
  splitter: {
    marginTop: 35,
    marginBottom: 25,
    opacity: 0.25,
    borderBottomWidth: 1,
  },
  verticleSplitter: {
    opacity: 0.4,
    borderWidth: 0.5,
    height: 45,
  },
  nodesListWrapper: {
    marginVertical: hp(30),
    flexDirection: 'row',
    width: '100%',
    flex: 1,
  },
  nodeListTitle: {
    fontSize: 14,
    letterSpacing: 1.12,
  },
  nodeDetail: {
    overflow: 'hidden',
    width: '95%',
    flexDirection: 'row',
  },
  nodeList: {
    width: '100%',
    borderRadius: 7,
    paddingHorizontal: wp(14),
    paddingTop: hp(20),
    paddingBottom: hp(18),
    marginBottom: hp(10),
    borderWidth: 1,
  },
  nodeButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: hp(10),
    marginTop: hp(15),
  },
  selectedItem: {
    borderRadius: 5,
  },
  actionText: {
    fontSize: 12,
    paddingTop: hp(4),
    marginLeft: wp(8),
  },
  actionArea: {
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeTextHeader: {
    marginHorizontal: 10,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  nodeTextValue: {
    fontSize: 12,
    letterSpacing: 1.56,
    marginLeft: 10,
    paddingBottom: 2,
  },
  activityIndicator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NodeSettings;
