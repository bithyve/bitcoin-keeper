import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import React, { useContext } from 'react';

import { LocalizationContext } from 'src/context/Localization/LocContext';
import Switch from 'src/components/Switch/Switch';
import Text from 'src/components/KeeperText';
import { hp } from 'src/constants/responsive';
import KeeperTextInput from 'src/components/KeeperTextInput';

const AddNode = ({
  setHost,
  setPort,
  setUseSSL,
  host,
  port,
  useSSL,
}: {
  host: string;
  port: string;
  useSSL: boolean;
  setHost: (host: string) => void;
  setPort: (port: string) => void;
  setUseSSL: (useSSL: boolean) => void;
}) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;

  return (
    <Box style={[styles.container, { backgroundColor: `${colorMode}.primaryBackground` }]}>
      <Box style={styles.box}>
        <Box style={styles.useSSL}>
          <Text color={`${colorMode}.primaryText`}>{settings.useSSL}</Text>
          <Switch value={useSSL} onValueChange={(value) => setUseSSL(value)} />
        </Box>
        <Box style={styles.inputArea}>
          <Box>
            <Text color={`${colorMode}.secondaryText`}>{common.URL}</Text>
            <KeeperTextInput
              placeholder={settings.host}
              value={host}
              autoCorrect={false}
              autoComplete="off"
              onChangeText={(text) => setHost(text.toLowerCase())}
              inpuBorderColor={`${colorMode}.receiptBorder`}
              inpuBackgroundColor={`${colorMode}.boxSecondaryBackground`}
            />
          </Box>
          <Box>
            <Text color={`${colorMode}.secondaryText`}>{common.portNumber}</Text>
            <KeeperTextInput
              placeholder={settings.portNumberPlaceholder}
              keyboardType="number-pad"
              value={port}
              autoCorrect={false}
              autoComplete="off"
              onChangeText={(text) => setPort(text)}
              inpuBorderColor={`${colorMode}.receiptBorder`}
              inpuBackgroundColor={`${colorMode}.boxSecondaryBackground`}
            />
          </Box>
        </Box>
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
  useSSL: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: hp(15),
  },
});

export default AddNode;
