import { useNavigation } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import { hp, wp } from 'src/constants/responsive';
import ConciergeIcon from 'src/assets/images/faqWhiteIcon.svg';
import Fonts from 'src/constants/Fonts';
import TechnicalSupport from '../KeeperConcierge/TechnicalSupport';
import { StatusBar } from 'react-native';

const KeeperSupport = () => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  return (
    <ScreenWrapper paddingHorizontal={0} backgroundcolor={`${colorMode}.primaryBackground`}>
      <StatusBar barStyle={colorMode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* header  */}
      <Box style={styles.header} borderBottomColor={`${colorMode}.separator`}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <ThemedSvg name={'back_Button'} />
        </TouchableOpacity>
        <CircleIconWrapper
          width={wp(40)}
          icon={<ConciergeIcon width={wp(20)} height={wp(20)} />}
          backgroundColor={`${colorMode}.pantoneGreen`}
        />
        <Text color={`${colorMode}.primaryText`} style={styles.headerText} medium>
          Keeper Support
        </Text>
      </Box>
      <Box style={styles.container}>
        {/* adjust the route accordingly  */}
        <TechnicalSupport route={navigation} />
      </Box>
    </ScreenWrapper>
  );
};

export default KeeperSupport;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: wp(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(10),
    paddingBottom: hp(24),
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 18,
    fontFamily: Fonts.LoraMedium,
    marginLeft: wp(13),
  },
  backButton: {
    height: hp(40),
    width: wp(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
