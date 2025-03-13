import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import TabBar from 'src/components/TabBar';
import { hp, wp } from 'src/constants/responsive';
import AddNode from './AddNode';
import Node from 'src/services/electrum/node';
import { NodeDetail } from 'src/services/wallets/interfaces';
import useToastMessage from 'src/hooks/useToastMessage';
import { useDispatch } from 'react-redux';
import {
  electrumClientConnectionExecuted,
  electrumClientConnectionInitiated,
} from 'src/store/reducers/login';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ScannerLight from 'src/assets/images/scanner-icon.svg';
import ScannerDark from 'src/assets/images/scanner-icon-white.svg';

import Buttons from 'src/components/Buttons';
import Note from 'src/components/Note/Note';
import {
  predefinedMainnetNodes,
  predefinedTestnetNodes,
} from 'src/services/electrum/predefinedNodes';
import SelectableServerItem from './components/SelectableServerItem';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import config from 'src/utils/service-utilities/config';
import { NetworkType } from 'src/services/wallets/enums';
import { updateAppImage } from 'src/store/sagaActions/bhr';

const PrivateElectrum = ({ host, port, useSSL, setHost, setPort, setUseSSL, connectionError }) => {
  return (
    <Box>
      <AddNode
        port={port}
        host={host}
        useSSL={useSSL}
        setHost={setHost}
        setPort={setPort}
        setUseSSL={setUseSSL}
        connectionError={connectionError}
      />
    </Box>
  );
};

const PublicServer = ({ currentlySelectedNode, handleSelectNode }) => {
  const predefinedNodes =
    config.NETWORK_TYPE === NetworkType.TESTNET ? predefinedTestnetNodes : predefinedMainnetNodes;
  return (
    <Box style={styles.nodeListContainer}>
      {predefinedNodes.map((node) => (
        <SelectableServerItem
          key={node.id}
          item={node}
          onSelect={handleSelectNode}
          currentlySelectedNode={currentlySelectedNode}
        />
      ))}
    </Box>
  );
};

const NodeSelection = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [nodeList, setNodeList] = useState([]);
  const [currentlySelectedNode, setCurrentlySelectedNodeItem] = useState(null);

  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [useSSL, setUseSSL] = useState(true);
  const [connectionError, setConnectionError] = useState('');
  const isDarkMode = colorMode === 'dark';

  const tabsData = [{ label: settings.publicServer }, { label: settings.privateElectrum }];

  const nodes: NodeDetail[] = Node.getAllNodes();

  useEffect(() => {
    setNodeList(nodes);
  }, [nodes.length]);

  const onSaveCallback = async (nodeDetail: NodeDetail) => {
    setSaveLoading(true);

    // Sanitize host
    if (nodeDetail.host.endsWith('/')) {
      nodeDetail.host = nodeDetail.host.slice(0, -1);
    }

    if (nodeDetail.host.startsWith('http://')) {
      nodeDetail.host = nodeDetail.host.replace('http://', '');
    } else if (nodeDetail.host.startsWith('https://')) {
      nodeDetail.host = nodeDetail.host.replace('https://', '');
    }

    const nodeToSave = { ...nodeDetail };
    const { saved, connectionError: nodeConnectionError } = await Node.save(nodeToSave, nodeList);
    if (saved) {
      const updatedNodeList = Node.getAllNodes();
      setNodeList(updatedNodeList);
      dispatch(updateAppImage({ wallets: null, signers: null }));
      const newNode = updatedNodeList.find(
        (node) => node.host === nodeToSave.host && node.port === nodeToSave.port
      );
      if (newNode) {
        onConnectToNode(newNode);
      }
    } else {
      if (nodeConnectionError) {
        let errorMessage = '';
        if (nodeConnectionError && typeof nodeConnectionError === 'object') {
          if (nodeConnectionError.err) {
            errorMessage = nodeConnectionError.err;
          } else if (nodeConnectionError.message) {
            errorMessage = nodeConnectionError.message;
          } else {
            errorMessage = nodeConnectionError.toString();
          }
        } else {
          errorMessage = nodeConnectionError.toString();
        }
        setConnectionError(errorMessage);
      }

      showToast(`Failed to save, unable to connect to: ${nodeToSave.host} `, <ToastErrorIcon />);
    }
    setSaveLoading(false);
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
      await Node.update(node, { isConnected: connected });
      dispatch(electrumClientConnectionExecuted({ successful: node.isConnected, connectedTo }));
      showToast(`Connected to: ${connectedTo}`, <TickIcon />);
      nodes = nodes.map((item) => {
        if (item.id === node.id) return { ...node };
        return item;
      });
      navigation.goBack();
    } else dispatch(electrumClientConnectionExecuted({ successful: node.isConnected, error }));

    setCurrentlySelectedNodeItem(node);
    setNodeList(nodes);
    setLoading(false);
  };

  const handleSelectNode = (node) => {
    setCurrentlySelectedNodeItem(node);
  };

  const onValidateAndSave = () => {
    if (!host || !port) {
      showToast('Host and port are required', <ToastErrorIcon />);
      return;
    }

    const nodeDetails: NodeDetail = {
      id: null,
      host,
      port,
      useKeeperNode: false,
      isConnected: false,
      useSSL,
    };
    onSaveCallback(nodeDetails);
  };

  const onQrScan = async (qrData) => {
    try {
      const nodeDetails = Node.decodeQR(qrData);
      if (nodeDetails) {
        setHost(nodeDetails.host.toLowerCase());
        setPort(nodeDetails.port);
        setUseSSL(nodeDetails.useSSL);
      }
      navigation.goBack();
    } catch (error) {
      showToast('Invalid QR code', <ToastErrorIcon />);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <ActivityIndicatorView visible={loading || saveLoading} />
      <KeeperHeader
        title="Server Selection"
        subtitle="Select a server you'd like to use. Add your own node for enhanced privacy."
      />
      <Box style={styles.tabBarContainer}>
        <TabBar
          radius={7}
          width="95%"
          tabs={tabsData}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setConnectionError('');
            setActiveTab(tab);
          }}
        />
      </Box>

      <Box style={styles.tabContentContainer}>
        <ScrollView>
          {activeTab === 0 ? (
            <PublicServer
              currentlySelectedNode={currentlySelectedNode}
              handleSelectNode={handleSelectNode}
            />
          ) : (
            <PrivateElectrum
              setHost={setHost}
              setPort={setPort}
              setUseSSL={setUseSSL}
              host={host}
              port={port}
              useSSL={useSSL}
              connectionError={connectionError}
            />
          )}
        </ScrollView>

        <Box style={[styles.footerContainer, { alignItems: activeTab === 0 ? null : 'center' }]}>
          {activeTab === 0 ? (
            <Note title={common.note} subtitle={settings.publicServerNote} />
          ) : (
            <Buttons
              secondaryText={settings.scanQRTitle}
              secondaryTextColor={`${colorMode}.noteTextClosed`}
              secondaryCallback={() =>
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'ScanNode',
                    params: {
                      onQrScan,
                    },
                  })
                )
              }
              fullWidth
              SecondaryIcon={
                isDarkMode ? (
                  <ScannerDark width={wp(14)} height={wp(14)} />
                ) : (
                  <ScannerLight width={wp(14)} height={wp(14)} />
                )
              }
            />
          )}

          <Buttons
            primaryText={settings.connectToServer}
            primaryDisable={activeTab === 0 ? !currentlySelectedNode : !host || !port}
            primaryCallback={
              activeTab === 0 ? () => onSaveCallback(currentlySelectedNode) : onValidateAndSave
            }
            fullWidth
          />
        </Box>
      </Box>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    alignSelf: 'center',
    marginTop: hp(30),
    marginBottom: hp(10),
  },
  tabContentContainer: {
    flex: 1,
  },
  footerContainer: {
    paddingTop: hp(20),
    gap: hp(20),
  },
  nodeListContainer: {
    marginVertical: hp(15),
    marginHorizontal: wp(5),
  },
});

export default NodeSelection;
