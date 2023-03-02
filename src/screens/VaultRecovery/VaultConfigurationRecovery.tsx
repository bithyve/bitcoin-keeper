import { Keyboard, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import React, { useState } from 'react';
import { Box } from 'native-base';
import { hp } from 'src/common/data/responsiveness/responsive';
import Fonts from 'src/common/Fonts';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import Buttons from 'src/components/Buttons';
import useConfigRecovery from 'src/hooks/useConfigReocvery';
import { Tile } from '../NewKeeperAppScreen/NewKeeperAppScreen';
import { useNavigation } from '@react-navigation/native';

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
        <View>
          <HeaderTitle
            title="Reocvery through vault configuration"
            subtitle="Recover the vault from output descriptor or configuration"
            headerTitleColor="light.textBlack"
            paddingTop={hp(5)}
          />

          <Box style={styles.inputWrapper} backgroundColor="light.textInputBackground">
            <TextInput
              placeholder="Enter the vault configuration or output descriptor"
              placeholderTextColor="light.GreyText"
              style={styles.textInput}
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
              }}
              multiline
            />
          </Box>
          <Box style={styles.tileContainer}>
            <Tile
              title="Scan or Import a file"
              subTitle="From your phone"
              onPress={() => {
                navigate('LoginStack', {
                  screen: 'ScanQRFileRecovery',
                  params: { initateRecovery },
                });
              }}
            />
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
    fontFamily: Fonts.RobotoCondensedRegular,
    opacity: 0.5,
    height: 150,
  },
  tileContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
});
