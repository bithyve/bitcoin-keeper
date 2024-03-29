import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import React, { useState } from 'react';
import { Box, Input, useColorMode } from 'native-base';
import { hp } from 'src/constants/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import Buttons from 'src/components/Buttons';
import useConfigRecovery from 'src/hooks/useConfigReocvery';
import { useNavigation } from '@react-navigation/native';
import { Tile } from '../NewKeeperAppScreen/NewKeeperAppScreen';

function VaultConfigurationCreation() {
  const { colorMode } = useColorMode();
  const [inputText, setInputText] = useState('');
  const { recoveryLoading, recoveryError, initateRecovery } = useConfigRecovery();
  const { navigate } = useNavigation();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={styles.wrapper}>
          <KeeperHeader
            title="Recover Using Wallet Configuration File"
            subtitle="Recover the vault from output descriptor/configuration/BSMS File"
          />
          <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
            <Input
              testID="input_walletConfigurationFile"
              placeholder="Enter the Wallet Configuration File"
              placeholderTextColor={`${colorMode}.primaryText`} // TODO: change to colorMode and use native base component
              style={styles.textInput}
              variant="unstyled"
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
              }}
              multiline
            />
          </Box>
          <Box style={styles.tileContainer}>
            <Box style={styles.tileWrapper}>
              <Tile
                title="Scan or Import a file"
                subTitle="From your phone"
                onPress={() => {
                  navigate('ScanQRFileRecovery');
                }}
              />
            </Box>
            <Buttons
              primaryCallback={() => initateRecovery(inputText)}
              primaryText="Create Vault"
              primaryLoading={recoveryLoading}
            />
          </Box>
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
}

export default VaultConfigurationCreation;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'column',
    marginVertical: hp(20),
    marginHorizontal: hp(5),
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
  },
  textInput: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
    opacity: 0.5,
    height: 150,
  },
  tileContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  tileWrapper: {
    marginBottom: 15,
  },
});
