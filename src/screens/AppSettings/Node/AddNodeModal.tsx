import { Box, Input } from 'native-base';
import { View, StyleSheet } from 'react-native';
import React, { useContext, useState } from 'react';

import { LocalizationContext } from 'src/common/content/LocContext';
import { NodeDetail } from 'src/core/wallets/interfaces';
import CheckBox from 'src/components/Checkbox';
import Buttons from 'src/components/Buttons';
import Switch from 'src/components/Switch/Switch';
import Text from 'src/components/KeeperText';

function AddNode(params: NodeDetail, onSaveCallback: (nodeDetails: NodeDetail) => void) {
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
    <View style={[styles.container, { backgroundColor: 'light.mainBackground' }]}>
      <Box style={styles.box}>
        <Box style={styles.useSSL}>
          <Text style={styles.useSSLText}>{settings.useSSL}</Text>
          <Switch value={useSSL} onValueChange={(value) => setUseSSL(value)} />
        </Box>
        <Box style={styles.checkboxArea}>
          <Text style={styles.useKeeperNodeText}>{settings.useKeeperNode}</Text>
          <CheckBox
            onPress={() => {
              setuseKeeperNode(!useKeeperNode);
            }}
            isChecked={useKeeperNode}
          />
        </Box>
        <Box style={styles.inputArea}>
          <Box style={!isHostValid ? [styles.error, { borderColor: 'rgba(255,0,51,1)' }] : null}>
            <Input
              placeholderTextColor="grey"
              backgroundColor="light.primaryBackground"
              placeholder={settings.host}
              borderRadius={10}
              borderWidth={0}
              height="12"
              value={host}
              width="150"
              autoCorrect={false}
              autoComplete="off"
              keyboardType="name-phone-pad"
              onChangeText={(text) => {
                setIsHostValid(!(text === null || text.length === 0));
                setHost(text);
              }}
            />
          </Box>
          <Box style={styles.spacer} />
          <Box w='50%'
            style={[styles.port, !isPortValid ? [styles.error, { borderColor: 'rgba(255,0,51,1)' }] : null]}
          >
            <Input
              placeholderTextColor="grey"
              backgroundColor="light.primaryBackground"
              placeholder={settings.portNumberPlaceholder}
              keyboardType="number-pad"
              borderRadius={10}
              borderWidth={0}
              height="12"
              width="145"
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
        <Box style={styles.saveButton}>
          <Buttons primaryText={common.save} primaryCallback={() => onValidateAndSave()} />
        </Box>
      </Box>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
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
    paddingTop: 5,
    flexDirection: 'row',
  },
  saveButton: {
    alignSelf: 'flex-end',
  },
  error: {
    borderWidth: 2,
    borderRadius: 7,
  },
  port: {
    flexDirection: 'row',
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
    width: '87%'
  },
});

export default AddNode;
