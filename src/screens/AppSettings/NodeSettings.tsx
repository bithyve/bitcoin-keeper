import { Box } from 'native-base';
import React, { useContext, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, Modal } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { hp, windowHeight } from 'src/common/data/responsiveness/responsive';
import { LocalizationContext } from 'src/common/content/LocContext';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setConnectToMyNode, setNodeDetails } from 'src/store/reducers/settings';
import { NodeDetail } from 'src/core/wallets/interfaces';
import HeaderTitle from 'src/components/HeaderTitle';
import Note from 'src/components/Note/Note';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Switch from 'src/components/Switch/Switch';
import AddIcon from 'src/assets/images/icon_add_new.svg';
import KeeperModal from 'src/components/KeeperModal';
import ElectrumClient from 'src/core/services/electrum/client';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import Text from 'src/components/KeeperText';
import AddNode from './AddNodeModal';

function NodeSettings() {
  const dispatch = useAppDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { settings } = translations;
  const { showToast } = useToastMessage();

  const { connectToMyNodeEnabled, nodeDetails } = useAppSelector((state) => state.settings);
  const [nodeList, setNodeList] = useState(nodeDetails || []);
  const [ConnectToNode, setConnectToNode] = useState(connectToMyNodeEnabled);
  const [visible, setVisible] = useState(false);
  const [selectedNodeItem, setSelectedNodeItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const openAddNodeModal = () => {
    setVisible(true);
  };

  const closeAddNodeModal = () => {
    if (nodeList.length == 0 || nodeList.filter((item) => item.isConnected == true).length == 0) {
      onChangeConnectToMyNode(false);
    }
    setVisible(false);
  };

  const onSaveCallback = async (nodeDetail: NodeDetail) => {
    if (
      nodeDetail.host == null ||
      nodeDetail.host.length == 0 ||
      nodeDetail.port == null ||
      nodeDetail.port.length == 0
    )
      return;

    closeAddNodeModal();
    const nodes = [...nodeList];
    const node = { ...nodeDetail };
    if (node.id == null) {
      node.id = nodeList.length + 1;
      nodes.push(node);
    } else {
      const index = nodes.findIndex((item) => item.id == node.id);
      node.isConnected = false;
      nodes[index] = node;
    }
    setNodeList(nodes);
    dispatch(setNodeDetails(nodes));
    setSelectedNodeItem(node);
  };

  const onAdd = () => {
    setSelectedNodeItem(null);
    openAddNodeModal();
  };

  const onEdit = async (selectedItem: NodeDetail) => {
    setSelectedNodeItem(selectedItem);
    openAddNodeModal();
  };

  const onConnectNode = async (selectedItem) => {
    setLoading(true);
    setSelectedNodeItem(selectedItem);
    const node = { ...selectedItem };

    const isValidNode = await ElectrumClient.testConnection(node.host, node.port, node.port);
    console.log(`Is Valid node ${isValidNode}`);

    let isElectrumClientConnected = false;
    let activePeer = null;

    if (isValidNode) {
      node.isConnected = true;
      ElectrumClient.setActivePeer(nodeList, node);
      await ElectrumClient.connect();
      isElectrumClientConnected = await ElectrumClient.ping();
    } else {
      ElectrumClient.setActivePeer([]);
      await ElectrumClient.connect();
    }

    activePeer = ElectrumClient.getActivePeer();
    console.log(activePeer);
    if (
      isElectrumClientConnected &&
      node.host === activePeer?.host &&
      (node.port === activePeer?.ssl || node.port === activePeer?.tcp)
    ) {
      showToast(`${settings.nodeConnectionSuccess}`, <TickIcon />);
      setConnectToNode(true);
      dispatch(setConnectToMyNode(true));
      node.isConnected = true;
      updateNode(node);
    } else {
      showToast(`${settings.nodeConnectionFailure}`, null, 1000, true);
      setConnectToNode(false);
      dispatch(setConnectToMyNode(false));
      node.isConnected = false;
      updateNode(node);
    }
    setLoading(false);
  };

  const updateNode = (selectedItem) => {
    const nodes = [...nodeList];
    const updatedNodes = nodes.map((item) => {
      const node = { ...item };
      node.isConnected = item.id === selectedItem?.id ? selectedItem.isConnected : false;
      return node;
    });

    setNodeList(updatedNodes);
    dispatch(setNodeDetails(updatedNodes));
  };

  const onSelectedNodeitem = (selectedItem: NodeDetail) => {
    setSelectedNodeItem(selectedItem);
  };

  const onChangeConnectToMyNode = async (value: boolean) => {
    setConnectToNode(value);
    dispatch(setConnectToMyNode(value));
    if (value) {
      openAddNodeModal();
    } else {
      setLoading(true);
      updateNode(null);
      ElectrumClient.setActivePeer([]);
      await ElectrumClient.connect();
      setLoading(false);
    }
  };

  const onNodeConnectionStatus = (node) => {
    const activePeer = ElectrumClient.getActivePeer();
    if (
      activePeer?.host === node.host &&
      (activePeer?.ssl === node.port || activePeer?.tcp === node.port)
    ) {
      return true;
    }
    return false;
  };

  const modalParams: NodeDetail = {
    id: selectedNodeItem?.id || null,
    host: selectedNodeItem?.host || '',
    port: selectedNodeItem?.port || '',
    useKeeperNode: selectedNodeItem?.useKeeperNode || false,
    isConnected: selectedNodeItem?.isConnected || false,
    useSSL: selectedNodeItem?.useSSL || false,
  };

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderTitle title={settings.nodeSettings} subtitle={settings.nodeSettingUsedSoFar} />
      <Box style={styles.nodeConnectSwitchWrapper}>
        <Box>
          <Text style={styles.connectToMyNodeTitle}>{settings.connectToMyNode}</Text>
          <Text style={styles.appSettingSubTitle} color="light.secondaryText">
            {settings.connectToMyNodeSubtitle}
          </Text>
        </Box>
        <Box>
          <Switch value={ConnectToNode} onValueChange={onChangeConnectToMyNode} />
        </Box>
      </Box>
      <Box borderColor="light.GreyText" style={styles.splitter} />
      <Box style={styles.nodeListHeader}>
        <Text style={styles.nodeListTitle}>{settings.nodesUsedPreviously}</Text>
      </Box>
      {nodeList.length > 0 && (
        <Box style={[styles.nodesListWrapper, { maxHeight: windowHeight > 750 ? 230 : 135 }]}>
          <FlatList
            data={nodeList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelectedNodeitem(item)}
                style={
                  item.id === selectedNodeItem?.id
                    ? [styles.selectedItem, { borderColor: '#017963' }]
                    : null
                }
              >
                <Box backgroundColor="light.lightYellow" style={styles.nodeList}>
                  <Box style={styles.nodeDetail}>
                    <Text style={[styles.nodeTextHeader, { color: '#4F5955' }]}>
                      {settings.host}
                    </Text>
                    <Text style={styles.nodeTextValue}>{item.host}</Text>
                    <Text style={[styles.nodeTextHeader, { color: '#4F5955' }]}>
                      {settings.portNumber}
                    </Text>
                    <Text style={styles.nodeTextValue}>{item.port}</Text>
                  </Box>
                  <TouchableOpacity onPress={() => onEdit(item)}>
                    <Text style={[styles.editText, { color: '#017963' }]}>{common.edit}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onConnectNode(item)}>
                    <Box
                      borderColor="light.brownborder"
                      backgroundColor={onNodeConnectionStatus(item) ? '#017963' : 'light.yellow2'}
                      style={styles.connectButton}
                    >
                      <Text>
                        {onNodeConnectionStatus(item) ? common.connected : common.connect}
                      </Text>
                    </Box>
                  </TouchableOpacity>
                </Box>
              </TouchableOpacity>
            )}
          />
        </Box>
      )}

      <TouchableOpacity onPress={onAdd}>
        <Box backgroundColor="light.lightYellow" style={styles.addNewNode}>
          <AddIcon />
          <Text style={styles.addNewNodeText}>{settings.addNewNode}</Text>
        </Box>
      </TouchableOpacity>

      <Box style={styles.note} backgroundColor="light.ReceiveBackground">
        <Note title={common.note} subtitle={settings.nodeSettingsNote} />
      </Box>
      <KeeperModal
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
        textColor="#041513"
        closeOnOverlayClick={false}
        Content={() => AddNode(modalParams, onSaveCallback)}
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
  nodeConnectSwitchWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  appSettingTitle: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 1.2,
    paddingBottom: 5,
  },
  appSettingSubTitle: {
    fontSize: 12,
    letterSpacing: 0.6,
  },
  connectToMyNodeTitle: {
    fontSize: 14,
    letterSpacing: 0.5,
    paddingBottom: 5,
  },
  note: {
    position: 'absolute',
    bottom: hp(35),
    marginLeft: 22.3,
    width: '100%',
    paddingTop: hp(10),
  },
  splitter: {
    marginTop: 35,
    marginBottom: 25,
    borderBottomWidth: 0.15,
  },
  nodesListWrapper: {
    marginBottom: 4,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  nodeListTitle: {
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  nodeListHeader: {
    marginHorizontal: 30,
    marginBottom: 15,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 40,
  },
  nodeDetail: {
    width: '50%',
    padding: 10,
  },
  nodeList: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 4,
    alignItems: 'center',
    borderRadius: 5,
    justifyContent: 'space-between',
  },
  selectedItem: {
    borderWidth: 1,
    borderRadius: 5,
  },
  editText: {
    fontSize: 12,
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  connectButton: {
    fontSize: 11,
    letterSpacing: 0.6,
    padding: 5,
    borderRadius: 5,
    marginRight: 25,
    width: 90,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nodeTextHeader: {
    marginHorizontal: 20,
    fontSize: 11,
    letterSpacing: 0.6,
    paddingTop: 2,
    paddingBottom: 2,
  },
  nodeTextValue: {
    fontSize: 12,
    letterSpacing: 0.6,
    marginHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 5,
  },
  activityIndicator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewNode: {
    marginTop: 10,
    paddingTop: 25,
    paddingBottom: 25,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  addNewNodeText: {
    fontSize: 15,
    fontWeight: '300',
    letterSpacing: 0.6,
    paddingLeft: 10,
  },
});

export default NodeSettings;
