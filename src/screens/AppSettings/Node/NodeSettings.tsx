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
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Text from 'src/components/KeeperText';
import AddNode from './AddNodeModal';
import Node from './node';

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
    setLoading(true);
    closeAddNodeModal();
    const { nodes, node } = await Node.save(nodeDetail, nodeList);
    if (nodes === null || node === null) {
      console.log('node not saved');
      setLoading(false);
      return;
    }

    setNodeList(nodes);
    dispatch(setNodeDetails(nodes));
    setSelectedNodeItem(node);
    setLoading(false);
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
    let node = { ...selectedItem };

    if (!selectedItem.isConnected) {
      node = await Node.connect(selectedItem, nodeList);
    }
    else {
      await disconnectNode(node);
      setLoading(false);
      return;
    }

    setConnectToNode(node?.isConnected);
    dispatch(setConnectToMyNode(node?.isConnected));
    updateNode(node);

    if (node.isConnected) {
      showToast(`${settings.nodeConnectionSuccess}`, <TickIcon />);
    }
    else {
      showToast(`${settings.nodeConnectionFailure}`, <ToastErrorIcon />, 1000, true);
    }

    setLoading(false);
  };

  const disconnectNode = async (node) => {
    node.isConnected = false;
    await Node.connectToDefaultNode();
    setConnectToNode(node?.isConnected);
    dispatch(setConnectToMyNode(node?.isConnected));
    updateNode(node);
  }

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
      setSelectedNodeItem(Node.getModalParams(null));
      openAddNodeModal();
    } else {
      setLoading(true);
      updateNode(null);
      Node.connectToDefaultNode();
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor='light.mainBackground' barStyle="dark-content">
      <HeaderTitle
        paddingLeft={25}
        title={settings.nodeSettings}
        subtitle={settings.nodeSettingUsedSoFar} />
      <Box style={styles.nodeConnectSwitchWrapper}>
        <Box>
          <Text
            color="light.primaryText"
            style={styles.connectToMyNodeTitle}>{settings.connectToMyNode}</Text>
          <Text
            style={styles.appSettingSubTitle}
            color="light.secondaryText">
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
                <Box backgroundColor="light.primaryBackground" style={styles.nodeList}>
                  <Box style={[styles.nodeDetail, { backgroundColor: 'light.primaryBackground' }]}>
                    <Text
                      color='light.secondaryText'
                      style={[styles.nodeTextHeader]}>
                      {settings.host}
                    </Text>
                    <Text style={styles.nodeTextValue}>{item.host}</Text>
                    <Text color='light.secondaryText' style={[styles.nodeTextHeader]}>
                      {settings.portNumber}
                    </Text>
                    <Text style={styles.nodeTextValue}>{item.port}</Text>
                  </Box>
                  <TouchableOpacity onPress={() => onEdit(item)}>
                    <Text
                      color='light.greenText2'
                      style={[styles.editText]}>{common.edit}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onConnectNode(item)}>
                    <Box
                      backgroundColor={Node.nodeConnectionStatus(item) ? 'light.greenText2' : 'light.lightAccent'}
                      style={styles.connectButton}
                    >
                      <Text style={{ color: Node.nodeConnectionStatus(item) ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)' }}>
                        {Node.nodeConnectionStatus(item) ? common.disconnect : common.connect}
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
        <Box backgroundColor="light.primaryBackground" style={styles.addNewNode}>
          <AddIcon />
          <Text style={styles.addNewNodeText}>{settings.addNewNode}</Text>
        </Box>
      </TouchableOpacity>

      <Box style={styles.note} backgroundColor="light.mainBackground">
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
        Content={() => AddNode(Node.getModalParams(selectedNodeItem), onSaveCallback)}
      />
      <Modal animationType="none" transparent visible={loading} onRequestClose={() => { }}>
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
    paddingLeft: 47
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
    bottom: hp(35),
    marginLeft: 22.3,
    width: '100%',
    paddingTop: hp(10),
  },
  splitter: {
    marginTop: 35,
    marginBottom: 25,
    opacity: 0.25,
    borderBottomWidth: 1,
  },
  nodesListWrapper: {
    marginBottom: 4,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  nodeListTitle: {
    fontSize: 14,
    letterSpacing: 1.12,
  },
  nodeListHeader: {
    marginHorizontal: 35,
    marginBottom: 15,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 40,
  },
  nodeDetail: {
    width: '55%',
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
    letterSpacing: 0.96,
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
    letterSpacing: 0.6
  },
  nodeTextValue: {
    fontSize: 12,
    letterSpacing: 1.56,
    marginHorizontal: 20,
    paddingBottom: 2,
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
    borderRadius: 10,
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
