import React, { useContext } from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import CopyIcon from 'src/assets/images/copy.svg';
import { StyleSheet } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';

type Props = {
  fingerprint: string;
  title?: string;
  copy?: Function;
};

function WalletFingerprint({ title, fingerprint, copy }: Props) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;

  return (
    <Box
      backgroundColor={`${colorMode}.seashellWhite`}
      borderColor={`${colorMode}.greyBorder`}
      style={styles.container}
    >
      <Box style={styles.textContainer}>
        {title && (
          <Text color={`${colorMode}.black`} style={styles.heading}>
            {title}
          </Text>
        )}
        <Text color={`${colorMode}.GreyText`} numberOfLines={1} style={styles.value}>
          {fingerprint}
        </Text>
      </Box>
      <Pressable
        testID={`btn_copyToClipboard${fingerprint}`}
        backgroundColor={`${colorMode}.whiteText`}
        style={styles.iconContainer}
        onPress={() => {
          Clipboard.setString(fingerprint);
          copy ? copy() : showToast(walletTranslation.walletIdCopied, <TickIcon />);
        }}
      >
        <CopyIcon />
      </Pressable>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    borderWidth: 1,
    borderRadius: 10,
    height: 55,
    marginVertical: hp(20),
  },
  heading: {
    fontSize: 14,
  },
  value: {
    fontSize: 16,
  },
  iconContainer: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(44),
    height: '80%',
    marginRight: wp(8),
  },
  textContainer: {
    paddingLeft: wp(5),
    margin: 10,
  },
});

export default WalletFingerprint;
