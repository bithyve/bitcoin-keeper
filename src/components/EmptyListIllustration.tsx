import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp } from 'src/constants/responsive';
import NoKeysIcon from 'src/assets/images/no_keys.svg';
import NoKeysDarkIcon from 'src/assets/images/no_keys_dark.svg';
import NoServersIcon from 'src/assets/images/no_servers.svg';
import NoServersDarkIcon from 'src/assets/images/no_servers_dark.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useContext } from 'react';

export function EmptyListIllustration({ listType }: { listType: 'keys' | 'nodes' }) {
  const { translations } = useContext(LocalizationContext);
  const { colorMode } = useColorMode();
  const titleText =
    listType === 'keys' ? translations.signer.NoKeysFound : translations.settings.NoServerAdded;
  const subtitleText =
    listType === 'keys'
      ? translations.signer.PleaseAddAKeyToGetStarted
      : translations.settings.NoServerAddedSubtitle;

  const Icon =
    listType === 'keys'
      ? colorMode === 'light'
        ? NoKeysIcon
        : NoKeysDarkIcon
      : colorMode === 'light'
      ? NoServersIcon
      : NoServersDarkIcon;
  return (
    <Box style={styles.emptyListContainer}>
      <Text color={`${colorMode}.textGreenGrey`} style={styles.emptyListTitle} medium>
        {titleText}
      </Text>
      <Text color={`${colorMode}.SlateGrey`} style={styles.emptyListSubtitle}>
        {subtitleText}
      </Text>
      <Icon style={styles.emptyListIcon} />
    </Box>
  );
}

const styles = StyleSheet.create({
  emptyListContainer: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    marginTop: hp(30),
  },
  emptyListTitle: {
    textAlign: 'center',
    fontSize: 15,
  },
  emptyListSubtitle: {
    marginTop: hp(5),
    textAlign: 'center',
    fontSize: 14,
    width: '80%',
    alignSelf: 'center',
  },
  emptyListIcon: {
    marginTop: hp(20),
    alignSelf: 'center',
  },
});

export default EmptyListIllustration;
