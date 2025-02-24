import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SigningServerIllustration from 'src/assets/images/Server-key-successful-illustration.svg';
import { hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const ServerKeySuccessScreen = () => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signingServer } = translations;
  return (
    <ScreenWrapper>
      <Box style={styles.container}>
        <SigningServerIllustration />
        <Text semiBold fontSize={18} color={`${colorMode}.textGreen`} style={styles.title}>
          {signingServer.successTitle}
        </Text>
        <Text fontSize={12} color={`${colorMode}.secondaryText`} style={styles.subtitle}>
          {signingServer.successSubTitle}
        </Text>
      </Box>
      <Buttons primaryCallback={() => {}} fullWidth primaryText="Finish" />
    </ScreenWrapper>
  );
};

export default ServerKeySuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    paddingVertical: hp(15),
  },
  subtitle: {
    textAlign: 'center',
  },
});
