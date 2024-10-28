import { Box, Input, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import React, { useContext, useState } from 'react';

import { LocalizationContext } from 'src/context/Localization/LocContext';
import { NodeDetail } from 'src/services/wallets/interfaces';
import Buttons from 'src/components/Buttons';
import Switch from 'src/components/Switch/Switch';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';

function AddNode(params: NodeDetail, onSaveCallback: (nodeDetails: NodeDetail) => void) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { settings } = translations;
  const [useKeeperNode, setuseKeeperNode] = useState(params?.useKeeperNode);
  const [useSSL, setUseSSL] = useState(params?.useSSL);
  const [host, setHost] = useState(params?.host || '');
  const [port, setPort] = useState(params?.port || '');
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
      const nodeDetails: NodeDetail = {
        id: params.id,
        host,
        port,
        useKeeperNode,
        isConnected: params.isConnected,
        useSSL,
      };
      onSaveCallback(nodeDetails);
    }
  };

  return (
    <Box style={[styles.container, { backgroundColor: `${colorMode}.primaryBackground` }]}>
      <Box style={styles.box}>
        <Box style={styles.useSSL}>
          <Text style={styles.useSSLText}>{settings.useSSL}</Text>
          <Switch
            value={useSSL}
            onValueChange={(value) => setUseSSL(value)}
            testID="switch_use_ssl"
          />
        </Box>
        <Box style={styles.inputArea}>
          <Box
            w="50%"
            style={!isHostValid ? [styles.error, { borderColor: 'rgba(255,0,51,1)' }] : null}
            backgroundColor={`${colorMode}.seashellWhite`}
            borderRadius={10}
          >
            <Input
              backgroundColor={`${colorMode}.seashellWhite`}
              placeholderTextColor="grey"
              placeholder={settings.host}
              borderRadius={10}
              borderWidth={0}
              height="12"
              fontSize={13}
              value={host}
              autoCorrect={false}
              autoComplete="off"
              onChangeText={(text) => {
                setIsHostValid(!(text === null || text.length === 0));
                setHost(text);
              }}
              _input={
                colorMode === 'dark' && {
                  selectionColor: Colors.SecondaryWhite,
                  cursorColor: Colors.SecondaryWhite,
                }
              }
            />
          </Box>
          <Box style={styles.spacer} />
          <Box
            w="50%"
            style={[!isPortValid ? [styles.error, { borderColor: 'rgba(255,0,51,1)' }] : null]}
            backgroundColor={`${colorMode}.seashellWhite`}
            borderRadius={10}
          >
            <Input
              backgroundColor={`${colorMode}.seashellWhite`}
              placeholderTextColor="grey"
              placeholder={settings.portNumberPlaceholder}
              keyboardType="number-pad"
              borderRadius={10}
              borderWidth={0}
              height="12"
              fontSize={13}
              value={port}
              autoCorrect={false}
              autoComplete="off"
              onChangeText={(text) => {
                setIsPortValid(!(text === null || text.length === 0));
                setPort(text);
              }}
              _input={
                colorMode === 'dark' && {
                  selectionColor: Colors.SecondaryWhite,
                  cursorColor: Colors.SecondaryWhite,
                }
              }
            />
          </Box>
        </Box>
        <Box style={styles.saveButton}>
          <Buttons primaryText={common.save} primaryCallback={() => onValidateAndSave()} />
        </Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
  },
  box: {
    width: '100%',
  },
  spacer: {
    marginLeft: 2,
    marginRight: 2,
  },
  checkboxArea: {
    paddingTop: 25,
    marginBottom: 25,
    paddingLeft: 10,
    flexDirection: 'row',
    width: '100%',
  },
  inputArea: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingTop: 5,
  },
  useSSLText: {
    fontSize: 14,
    letterSpacing: 1.12,
    paddingTop: 7,
    paddingRight: 10,
  },
  useKeeperNodeText: {
    fontSize: 14,
    letterSpacing: 1.12,
    paddingTop: 7,
    paddingRight: 10,
    width: '87%',
  },
});

export default AddNode;
