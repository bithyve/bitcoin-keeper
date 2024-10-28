import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp } from 'src/constants/responsive';
import NoKeysIcon from 'src/assets/images/no_keys.svg';
import NoKeysDarkIcon from 'src/assets/images/no_keys_dark.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useContext } from 'react';

export function NoKeysIllustration() {
  const { translations } = useContext(LocalizationContext);
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.noKeysContainer}>
      <Text color={`${colorMode}.textGreenGrey`} style={styles.noKeysTitle} medium>
        {translations.signer.NoKeysFound}
      </Text>
      <Text color={`${colorMode}.SlateGrey`} style={styles.noKeysSubtitle}>
        {translations.signer.PleaseAddAKeyToGetStarted}
      </Text>
      {colorMode === 'light' ? (
        <NoKeysIcon style={styles.noKeysIcon} />
      ) : (
        <NoKeysDarkIcon style={styles.noKeysIcon} />
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  noKeysContainer: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    marginTop: hp(30),
  },
  noKeysTitle: {
    textAlign: 'center',
    fontSize: 15,
  },
  noKeysSubtitle: {
    marginTop: hp(5),
    textAlign: 'center',
    fontSize: 14,
  },
  noKeysIcon: {
    marginTop: hp(20),
    alignSelf: 'center',
  },
});

export default NoKeysIllustration;
