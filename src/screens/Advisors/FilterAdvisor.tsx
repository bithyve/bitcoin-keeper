import { Box, ScrollView, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import WalletHeader from 'src/components/WalletHeader';
import { wp } from 'src/constants/responsive';

const FilterAdvisor = () => {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title="Filter Advisors" />
      <ScrollView style={{ flex: 1, marginTop: wp(5) }} showsVerticalScrollIndicator={false}>
        {/* country  */}
        <Box style={styles.container}>
          <Text color={`${colorMode}.primaryText`}>Choose a Country</Text>
          <TouchableOpacity onPress={() => {}}>
            <Box
              backgroundColor={`${colorMode}.textInputBackground`}
              style={styles.selectingWallet}
              borderColor={`${colorMode}.separator`}
            >
              <Box>
                <Text color={`${colorMode}.placeHolderTextColor`} fontSize={12}>
                  Choose country
                </Text>
              </Box>
              <ThemedSvg name={'swap_down_icon'} />
            </Box>
          </TouchableOpacity>
        </Box>
        {/* TimeZone  */}
        <Box style={styles.container}>
          <Text color={`${colorMode}.primaryText`}>Time zone </Text>
          <Text color={`${colorMode}.primaryText`} fontSize={12}>
            Choose your preferred time zone
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <Box
              backgroundColor={`${colorMode}.textInputBackground`}
              style={styles.selectingWallet}
              borderColor={`${colorMode}.separator`}
            >
              <Text color={`${colorMode}.placeHolderTextColor`} fontSize={12}>
                Choose time zone{' '}
              </Text>

              <ThemedSvg name={'swap_down_icon'} />
            </Box>
          </TouchableOpacity>
        </Box>
        {/* Language  */}
        <Box style={styles.container}>
          <Text color={`${colorMode}.primaryText`}>Language</Text>
          <Text color={`${colorMode}.primaryText`} fontSize={12}>
            Choose your language preference
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <Box
              backgroundColor={`${colorMode}.textInputBackground`}
              style={styles.selectingWallet}
              borderColor={`${colorMode}.separator`}
            >
              <Box>
                <Text color={`${colorMode}.placeHolderTextColor`}>Choose language </Text>
              </Box>
              <ThemedSvg name={'swap_down_icon'} />
            </Box>
          </TouchableOpacity>
        </Box>
        {/* Experties  */}
        <Box style={styles.container}>
          <Text color={`${colorMode}.primaryText`}>Area of expertise</Text>
          <Text color={`${colorMode}.primaryText`} fontSize={12}>
            What do you need help with?
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <Box
              backgroundColor={`${colorMode}.textInputBackground`}
              style={styles.selectingWallet}
              borderColor={`${colorMode}.separator`}
            >
              <Text color={`${colorMode}.placeHolderTextColor`}>Choose Expertise</Text>

              <ThemedSvg name={'swap_down_icon'} />
            </Box>
          </TouchableOpacity>
        </Box>
      </ScrollView>
      <Buttons primaryText="Save Changes" fullWidth />
    </ScreenWrapper>
  );
};

export default FilterAdvisor;

const styles = StyleSheet.create({
  selectingWallet: {
    minHeight: wp(45),
    borderRadius: wp(10),
    paddingHorizontal: wp(16),
    paddingVertical: wp(18),
    borderWidth: 1,
    marginBottom: wp(10),
    marginTop: wp(5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    gap: wp(10),
    marginTop: wp(10),
  },
});
