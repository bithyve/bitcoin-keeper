import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useAppDispatch } from 'src/store/hooks';
import { NodeDetail } from 'src/services/wallets/interfaces';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import {
  electrumClientConnectionExecuted,
  electrumClientConnectionInitiated,
} from 'src/store/reducers/login';
import Node from 'src/services/electrum/node';
import TickIcon from 'src/assets/images/icon_tick.svg';
import DowngradeToPleb from 'src/assets/images/downgradetopleb.svg';
import DowngradeToPlebDark from 'src/assets/images/downgradetoplebDark.svg';
import Buttons from 'src/components/Buttons';
import EmptyListIllustration from 'src/components/EmptyListIllustration';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ServerItem from './components/ServerItem';
import WarningNote from 'src/components/WarningNote';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';

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
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { settings } = translations;
  const { showToast } = useToastMessage();

  const [nodeList, setNodeList] = useState([]);
  const [currentlySelectedNode, setCurrentlySelectedNodeItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [electrumDisconnectWarningVisible, setElectrumDisconnectWarningVisible] = useState(false);
  const [nodeToDisconnect, setNodeToDisconnect] = useState(null);
  const [nodeToDelete, setNodeToDelete] = useState(null);

  const isNodeListEmpty = nodeList.length === 0;
  const isNoNodeConnected = !currentlySelectedNode || !currentlySelectedNode.isConnected;

  const nodes: NodeDetail[] = Node.getAllNodes();
  const nodesLength = nodes.length;

  useEffect(() => {
    const current = nodes.filter((node) => Node.nodeConnectionStatus(node))[0];
    setCurrentlySelectedNodeItem(current);
    setNodeList(nodes);
  }, [nodesLength]);

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
      <ActivityIndicatorView visible={loading} />
      <KeeperHeader
        title={settings.nodeSettings}
        subtitle={settings.manageElectrumServersSubtitle}
      />
      <Box style={styles.nodesListWrapper}>
        {nodeList.length > 0 ? (
          <FlatList
            data={nodeList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ServerItem
                item={item}
                currentlySelectedNode={currentlySelectedNode}
                onSelectedNodeitem={onSelectedNodeitem}
                onDelete={onDelete}
                onConnectToNode={onConnectToNode}
                setNodeToDelete={setNodeToDelete}
                setNodeToDisconnect={setNodeToDisconnect}
                setElectrumDisconnectWarningVisible={setElectrumDisconnectWarningVisible}
              />
            )}
          />
        ) : (
          <Box flex={1}>
            <EmptyListIllustration listType="nodes" />
          </Box>
        )}
      </Box>
      <Box style={styles.footerContainer}>
        {isNoNodeConnected && !isNodeListEmpty && (
          <WarningNote noteText="You're not connected to any Electrum server. Some functionalities may not work." />
        )}
        <Buttons
          primaryCallback={() => navigation.dispatch(CommonActions.navigate('NodeSelection'))}
          primaryText={`${settings.addNewNode}`}
          fullWidth
        />
      </Box>
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
  activityIndicator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerContainer: {
    gap: hp(30),
  },
});

export default NodeSettings;
