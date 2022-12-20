import { TextInput } from 'react-native';
// libraries
import { Box, Text } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import Tapsigner from 'src/assets/images/svgs/Tapsigner_brown.svg';
import { ScaledSheet } from 'react-native-size-matters';
// components
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import Buttons from 'src/components/Buttons';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

function AddDescription({ route }) {
  const navigation = useNavigation();

  return (
    <Box style={styles.Container}>
      <StatusBarComponent padding={50} />
      <Box marginX={3}>
        <Box width={wp(200)}>
          <HeaderTitle
            title="Add Description"
            subtitle="Optionally you can add a short description to the Signing Device"
            onPressHandler={() => navigation.goBack()}
            headerTitleColor="light.textBlack"
            paddingTop={hp(5)}
          />
        </Box>

        <Box flexDirection="row" alignItems="center" marginTop={hp(91)}>
          <Tapsigner />
          <Box>
            <Text fontWeight={200} fontSize={14} letterSpacing={1.12}>
              TapSigner
            </Text>
            <Text fontWeight={200} fontSize={10} letterSpacing={1} color="light.greenText">
              Added on 12 January 2022
            </Text>
          </Box>
        </Box>

        <Box marginTop={hp(20)} width="100%">
          <Text textAlign="right" fontWeight={200} fontSize={10} letterSpacing={1}>
            2/10
          </Text>
          <TextInput
            placeholder="Add Description"
            style={styles.textInput}
            placeholderTextColor="#073E39"
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

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    backgroundColor: 'light.ReceiveBackground',
  },
  linearGradient: {
    borderRadius: 6,
    marginTop: hp(3),
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
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: '0.20@s',
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
