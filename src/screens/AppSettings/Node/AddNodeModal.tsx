import { Box, Input, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import React, { useContext, useState } from 'react';

import { LocalizationContext } from 'src/context/Localization/LocContext';
import { NodeDetail } from 'src/services/wallets/interfaces';
import Buttons from 'src/components/Buttons';
import Switch from 'src/components/Switch/Switch';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { hp, wp } from 'src/constants/responsive';
import KeeperTextInput from 'src/components/KeeperTextInput';

const AddNode = ({
  nodeDetails,
  onSaveCallback,
}: {
  nodeDetails: NodeDetail;
  onSaveCallback: (nodeDetails: NodeDetail) => void;
}) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;

  const [useKeeperNode, setUseKeeperNode] = useState(nodeDetails?.useKeeperNode);
  const [useSSL, setUseSSL] = useState(nodeDetails?.useSSL);
  const [host, setHost] = useState(nodeDetails?.host || '');
  const [port, setPort] = useState(nodeDetails?.port || '');
  const [isHostValid, setIsHostValid] = useState(true);
  const [isPortValid, setIsPortValid] = useState(true);

  const onValidateAndSave = () => {
    if (host === null || host.length === 0) {
      setIsHostValid(false);
    }

    if (port === null || port.length === 0) {
      setIsPortValid(false);
    }
    if (host !== null && host.length !== 0 && port !== null && port.length !== 0) {
      const updatedNodeDetails: NodeDetail = {
        id: nodeDetails.id,
        host,
        port,
        useKeeperNode,
        isConnected: nodeDetails.isConnected,
        useSSL,
      };
      onSaveCallback(updatedNodeDetails);
    }
  };

  return (
    <Box style={[styles.container, { backgroundColor: `${colorMode}.primaryBackground` }]}>
      <Box style={styles.box}>
        <Box style={styles.useSSL}>
          <Text color={`${colorMode}.Black`}>{settings.useSSL}</Text>
          <Switch
            value={useSSL}
            onValueChange={(value) => setUseSSL(value)}
            testID="switch_use_ssl"
          />
        </Box>
        <Box style={styles.inputArea}>
          <Box>
            <Text color={`${colorMode}.secondaryText`}>URL</Text>
            <KeeperTextInput
              placeholder={settings.host}
              value={host}
              autoCorrect={false}
              autoComplete="off"
              onChangeText={(text) => {
                setIsHostValid(!(text === null || text.length === 0));
                setHost(text);
              }}
            />
          </Box>
          <Box>
            <Text color={`${colorMode}.secondaryText`}>Port Number</Text>
            <KeeperTextInput
              placeholder={settings.portNumberPlaceholder}
              keyboardType="number-pad"
              value={port}
              autoCorrect={false}
              autoComplete="off"
              onChangeText={(text) => {
                setIsPortValid(!(text === null || text.length === 0));
                setPort(text);
              }}
            />
          </Box>
        </Box>
        {/* <Box style={styles.saveButton}>
          <Buttons primaryText={common.save} primaryCallback={onValidateAndSave} />
        </Box> */}
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '95%',
    flexDirection: 'row',
  },
  box: {
    width: '100%',
  },
  inputArea: {
    paddingTop: hp(20),
    gap: 10,
  },
  saveButton: {
    alignSelf: 'flex-end',
  },
  error: {
    borderWidth: 2,
    borderRadius: 7,
  },
  useSSL: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: hp(15),
  },
});

export default AddNode;
