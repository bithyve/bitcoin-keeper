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
import { updateAppImage } from 'src/store/sagaActions/bhr';
import { ELECTRUM_CLIENT } from 'src/services/electrum/client';

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
  const { common, settings } = translations;
  const { showToast } = useToastMessage();

  const [nodeList, setNodeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [electrumDisconnectWarningVisible, setElectrumDisconnectWarningVisible] = useState(false);
  const [nodeToDisconnect, setNodeToDisconnect] = useState(null);
  const [nodeToDelete, setNodeToDelete] = useState(null);

  const isNodeListEmpty = nodeList.length === 0;
  const isNoNodeConnected =
    !ELECTRUM_CLIENT.isClientConnected && nodeList.every((node) => !node.isConnected);

  const nodes: NodeDetail[] = Node.getAllNodes();

  useEffect(() => {
    setNodeList(nodes);
  }, [nodes.length]);

  const onDelete = async (selectedItem: NodeDetail) => {
    const isConnected = Node.nodeConnectionStatus(selectedItem);
    if (isConnected) await Node.disconnect(selectedItem);

    const status = Node.delete(selectedItem);
    if (status) {
      const updatedNodes = Node.getAllNodes();
      setNodeList(updatedNodes);
      dispatch(updateAppImage({ wallets: null, signers: null, updateNodes: true }));
    }
  };

  const onConnectToNode = async (selectedNode: NodeDetail) => {
    let updatedNodes = Node.getAllNodes();

    // Disconnect the currently connected node if it's not the selected one
    const currentlySelectedNode = updatedNodes.find((node) => node.isConnected);
    if (currentlySelectedNode && currentlySelectedNode.id !== selectedNode.id) {
      await Node.disconnect(currentlySelectedNode);
      currentlySelectedNode.isConnected = false;
      Node.update(currentlySelectedNode, { isConnected: currentlySelectedNode.isConnected });
      updatedNodes = updatedNodes.map((node) =>
        node.id === currentlySelectedNode.id ? { ...currentlySelectedNode } : node
      );
    }

    dispatch(electrumClientConnectionInitiated());
    setLoading(true);

    const { connected, connectedTo, error } = await Node.connectToSelectedNode(selectedNode);

    if (connected) {
      selectedNode.isConnected = connected;
      Node.update(selectedNode, { isConnected: connected });
      dispatch(electrumClientConnectionExecuted({ successful: connected, connectedTo }));
      showToast(`Connected to: ${connectedTo}`, <TickIcon />);
    } else {
      dispatch(electrumClientConnectionExecuted({ successful: connected, error }));
    }

    updatedNodes = updatedNodes.map((node) =>
      node.id === selectedNode.id ? { ...selectedNode } : node
    );
    setNodeList(updatedNodes);
    setLoading(false);
  };

  const onDisconnectToNode = async (selectedNode: NodeDetail) => {
    try {
      setLoading(true);
      Node.disconnect(selectedNode);
      selectedNode.isConnected = false;
      Node.update(selectedNode, { isConnected: selectedNode.isConnected });
      showToast(`Disconnected from ${selectedNode.host}`, <ToastErrorIcon />);

      const updatedNodes = nodeList.map((node) =>
        node.id === selectedNode.id ? { ...selectedNode } : node
      );
      setNodeList(updatedNodes);
      setLoading(false);
    } catch (error) {
      console.error('Error disconnecting electrum client', error);
      showToast(`Failed to disconnect from Electrum server`, <ToastErrorIcon />);
    }
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
        {isNoNodeConnected ? (
          isNodeListEmpty ? (
            <WarningNote noteText={settings.noNodeWarning1} />
          ) : (
            <WarningNote noteText={settings.noNodeWarning2} />
          )
        ) : null}

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
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
