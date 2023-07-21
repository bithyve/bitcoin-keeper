/* eslint-disable react/no-unstable-nested-components */
import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, Modal } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { hp, windowHeight } from 'src/common/data/responsiveness/responsive';
import { LocalizationContext } from 'src/common/content/LocContext';
import { useAppDispatch } from 'src/store/hooks';
import { NodeDetail } from 'src/core/wallets/interfaces';
import HeaderTitle from 'src/components/HeaderTitle';
import Note from 'src/components/Note/Note';
import ScreenWrapper from 'src/components/ScreenWrapper';
// import Switch from 'src/components/Switch/Switch';
import AddIcon from 'src/assets/images/add.svg';
// import EditIcon from 'src/assets/images/edit_yellow.svg';
import ConnectIcon from 'src/assets/images/connectNode.svg';
import DisconnectIcon from 'src/assets/images/disconnectNode.svg';
import DeleteIcon from 'src/assets/images/deleteNode.svg';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Text from 'src/components/KeeperText';
import {
  electrumClientConnectionExecuted,
  electrumClientConnectionInitiated,
} from 'src/store/reducers/login';
import AddNode from './AddNodeModal';
import Node from '../../../core/services/electrum/node';

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
    const { saved } = await Node.save(nodeDetail, nodeList);
    if (saved) {
      const updatedNodeList = Node.getAllNodes();
      setNodeList(updatedNodeList);
      // dispatch(updateAppImage(null));
      // setCurrentlySelectedNodeItem(node);
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
    let nodes = [...nodeList];
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

      nodes = nodes.map((item) => {
        if (item.id === node.id) return { ...node };
        return item;
      });
      // dispatch(updateAppImage(null));
    } else dispatch(electrumClientConnectionExecuted({ successful: node.isConnected, error }));

    setCurrentlySelectedNodeItem(node);
    setNodeList(nodes);
    setLoading(false);
  };

  const onDisconnectToNode = async (selectedNode: NodeDetail) => {
    let nodes = [...nodeList];

    setLoading(true);
    const node = { ...selectedNode };
    await Node.disconnect(node);
    node.isConnected = false;
    Node.update(node, { isConnected: node.isConnected });
    // showToast(`Disconnected from ${node.host}`, <ToastErrorIcon />);

    nodes = nodes.map((item) => {
      if (item.id === node.id) return { ...node };
      return item;
    });
    setNodeList(nodes);
    setCurrentlySelectedNodeItem(null);
    setLoading(false);
  };

  const onSelectedNodeitem = (selectedItem: NodeDetail) => {
    setCurrentlySelectedNodeItem(selectedItem);
  };
  console.log('windowHeight', windowHeight)
  return (
    <ScreenWrapper backgroundColor={`${colorMode}.mainBackground`} barStyle="dark-content">
      <HeaderTitle
        paddingLeft={25}
        title={settings.nodeSettings}
        subtitle={settings.nodeSettingUsedSoFar}
      />
      {/* <Box style={styles.nodeConnectSwitchWrapper}>
        <Box>
          <Text color={`${colorMode}.primaryText`} style={styles.connectToMyNodeTitle}>
            {settings.connectToMyNode}
          </Text>
          <Text style={styles.appSettingSubTitle} color={`${colorMode}.secondaryText`}>
            {settings.connectToMyNodeSubtitle}
          </Text>
        </Box>
        <Box>
          <Switch value={ConnectToNode} onValueChange={onChangeConnectToMyNode} />
        </Box>
      </Box> */}
      {/* <Box borderColor="light.GreyText" style={styles.splitter} /> */}
      {/* <Box style={styles.nodeListHeader}>
        <Text style={styles.nodeListTitle}>{settings.currentlyConnected}</Text>
      </Box> */}
      {nodeList.length > 0 && (
        <Box style={styles.nodesListWrapper}>
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
                    backgroundColor={isConnected ? 'light.primaryBackground' : 'light.fadedGray'}
                    style={[styles.nodeList]}
                  >
                    <Box
                      style={[
                        styles.nodeDetail,
                        {
                          backgroundColor: isConnected
                            ? 'light.primaryBackground'
                            : 'light.fadedGray',
                        },
                      ]}
                    >
                      <Box style={{ width: '60%' }}>
                        <Text color="light.secondaryText" style={[styles.nodeTextHeader]}>
                          {settings.host}
                        </Text>
                        <Text numberOfLines={1} style={styles.nodeTextValue}>
                          {item.host}
                        </Text>
                      </Box>
                      <Box>
                        <Text color="light.secondaryText" style={[styles.nodeTextHeader]}>
                          {settings.portNumber}
                        </Text>
                        <Text style={styles.nodeTextValue}>{item.port}</Text>
                      </Box>
                    </Box>
                    <Box style={styles.nodeButtons}>
                      <TouchableOpacity
                        onPress={() => {
                          if (!isConnected) onConnectToNode(item);
                          else onDisconnectToNode(item);
                        }}
                      >
                        <Box
                          style={[
                            styles.actionArea,
                            { width: 70, paddingTop: isConnected ? 4 : 5 },
                          ]}
                        >
                          {isConnected ? <DisconnectIcon /> : <ConnectIcon />}
                          <Text style={[styles.actionText, { paddingTop: isConnected ? 0 : 1 }]}>
                            {isConnected ? common.disconnect : common.connect}
                          </Text>
                        </Box>
                      </TouchableOpacity>
                      <Box borderColor="light.GreyText" style={styles.verticleSplitter} />
                      <TouchableOpacity onPress={() => onDelete(item)}>
                        <Box style={[styles.actionArea, { paddingLeft: 10 }]}>
                          <DeleteIcon />
                          <Text style={[styles.actionText, { paddingTop: 2 }]}>
                            {common.delete}
                          </Text>
                        </Box>
                      </TouchableOpacity>
                    </Box>
                  </Box>
                </TouchableOpacity>
              );
            }}
          />
        </Box>
      )}

      <TouchableOpacity onPress={onAdd}>
        <Box backgroundColor="#E3BE96" style={styles.addNewNode}>
          <AddIcon />
          <Text style={styles.addNewNodeText}>{settings.addNewNode}</Text>
        </Box>
      </TouchableOpacity>

      <Box style={styles.note} backgroundColor={`${colorMode}.mainBackground`}>
        <Note title={common.note} subtitle={settings.nodeSettingsNote} />
      </Box>

      <KeeperModal
        justifyContent="center"
        visible={visible}
        close={closeAddNodeModal}
        title={settings.nodeDetailsTitle}
        subTitle={settings.nodeDetailsSubtitle}
        subTitleColor="#5F6965"
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText=""
        buttonTextColor="#FAFAFA"
        buttonCallback={closeAddNodeModal}
        closeOnOverlayClick={false}
        Content={() => AddNode(Node.getModalParams(currentlySelectedNode), onSaveCallback)}
      />
      <Modal animationType="none" transparent visible={loading} onRequestClose={() => { }}>
        <View style={styles.activityIndicator}>
          <ActivityIndicator color="#017963" size="large" />
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
console.log(windowHeight)
const styles = StyleSheet.create({
  nodeConnectSwitchWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingLeft: 47,
  },
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
  note: {
    position: 'absolute',
    bottom: hp(25),
    marginLeft: 22.3,
    width: '100%',
    paddingTop: hp(5),
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
    marginVertical: 10,
    flexDirection: 'row',
    width: '100%',
    height: windowHeight > 800 ? '65%' : '56%',
    // alignItems: 'center',
  },
  nodeListTitle: {
    fontSize: 14,
    letterSpacing: 1.12,
  },
  nodeListHeader: {
    marginHorizontal: 5,
    marginVertical: 20,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 40,
  },
  nodeDetail: {
    width: '64%',
    flexDirection: 'row',
    paddingHorizontal: 3,
    paddingVertical: 22,
  },
  nodeList: {
    flexDirection: 'row',
    width: '99%',
    marginBottom: 4,
    alignItems: 'center',
    borderRadius: 5,
  },
  nodeButtons: {
    flexDirection: 'row',
    width: '36%',
  },
  selectedItem: {
    borderRadius: 5,
  },
  edit: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 11,
    letterSpacing: 0.36,
    fontWeight: '600',
    paddingTop: 4,
  },
  actionArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
  },
  delete: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeTextHeader: {
    marginHorizontal: 20,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  nodeTextValue: {
    fontSize: 12,
    letterSpacing: 1.56,
    marginLeft: 20,
    paddingBottom: 2,
  },
  activityIndicator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewNode: {
    height: 60,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  addNewNodeText: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.6,
    paddingLeft: 10,
  },
});

export default NodeSettings;
