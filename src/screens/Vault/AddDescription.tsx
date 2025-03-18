import { StyleSheet, TextInput } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import Tapsigner from 'src/assets/images/Tapsigner_brown.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import StatusBarComponent from 'src/components/StatusBarComponent';
import Buttons from 'src/components/Buttons';
import { hp, wp } from 'src/constants/responsive';
import { Colors } from 'react-native/Libraries/NewAppScreen';

function AddDescription({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  return (
    <Box style={[styles.Container, { backgroundColor: `${colorMode}.textInputBackground` }]}>
      <StatusBarComponent padding={50} />
      <Box marginX={3}>
        <Box width={wp(200)}>
          <KeeperHeader
            title="Add Description"
            subtitle="Optionally you can add a short description to the signer"
          />
        </Box>

        <Box flexDirection="row" alignItems="center" marginTop={hp(91)}>
          <Tapsigner />
          <Box>
            <Text fontSize={14} letterSpacing={1.12}>
              TapSigner
            </Text>
            <Text fontSize={10} letterSpacing={1} color={`${colorMode}.greenText`}>
              Added on 12 January 2022
            </Text>
          </Box>
        </Box>

        <Box marginTop={hp(20)} width="100%">
          <Text textAlign="right" fontSize={10} letterSpacing={1}>
            2/10
          </Text>
          <TextInput
            placeholder="Add Description"
            style={styles.textInput}
            placeholderTextColor={Colors.GreenishGrey} // TODO: change to colorMode and use native base component
          />
        </Box>

        <Box marginTop={hp(70)}>
          <Buttons
            primaryText="Proceed"
            primaryCallback={() => {}}
            secondaryText="Skip"
            secondaryCallback={() => {}}
          />
        </Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    letterSpacing: 0.24,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 0.2,
  },

  textInput: {
    width: '100%',
    backgroundColor: '#FDF7F0',
    borderRadius: 10,
    opacity: 0.5,
    padding: 15,
  },
});
export default AddDescription;
