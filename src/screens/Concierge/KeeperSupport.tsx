import { useNavigation } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TechnicalSupport from '../KeeperConcierge/TechnicalSupport';

const KeeperSupport = () => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  return (
    <ScreenWrapper paddingHorizontal={0} backgroundcolor={`${colorMode}.primaryBackground`}>
      <StatusBar barStyle={colorMode === 'dark' ? 'light-content' : 'dark-content'} />
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
    paddingTop: wp(10),
  },
});
