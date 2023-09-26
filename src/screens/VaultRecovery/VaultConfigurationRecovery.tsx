import { Keyboard, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import React, { useState } from 'react';
import { Box } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import Fonts from 'src/constants/Fonts';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import Buttons from 'src/components/Buttons';
import useConfigRecovery from 'src/hooks/useConfigReocvery';
import { useNavigation } from '@react-navigation/native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Tile } from '../NewKeeperAppScreen/NewKeeperAppScreen';

function VaultConfigurationRecovery() {
  const [inputText, setInputText] = useState('');
  const { recoveryLoading, initateRecovery } = useConfigRecovery();
  const { navigate } = useNavigation();

  return (
    <ScreenWrapper>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={styles.wrapper}>
          <HeaderTitle
            title="Recovery through Vault configuration"
            subtitle="Recover the Vault from output descriptor or configuration"
          />
          <Box style={styles.inputWrapper} backgroundColor="light.textInputBackground">
            <TextInput
              placeholder="Enter the Vault configuration or output descriptor"
              placeholderTextColor={Colors.Feldgrau} // TODO: change to colorMode and use native base component
              style={styles.textInput}
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
                  navigate('LoginStack', {
                    screen: 'ScanQRFileRecovery',
                  });
                }}
              />
            </Box>
            <Buttons
              primaryCallback={() => initateRecovery(inputText)}
              primaryText="Recover"
              primaryLoading={recoveryLoading}
            />
          </Box>
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
}

export default VaultConfigurationRecovery;

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
