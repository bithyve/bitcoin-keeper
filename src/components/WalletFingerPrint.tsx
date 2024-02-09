import React, { useContext } from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import CopyIcon from 'src/assets/images/copy.svg';
import { StyleSheet } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Text from './KeeperText';
import { hp } from 'src/constants/responsive';

type Props = {
  fingerprint: string;
  title?: string;
};

function WalletFingerprint({ title, fingerprint }: Props) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;

  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.container}>
      <Box style={styles.textContainer}>
        <Text color={`${colorMode}.black`} style={styles.heading}>
          {title ? title : 'Wallet Fingerprint'}
        </Text>
        <Text color={`${colorMode}.GreenishGrey`} style={styles.value}>
          {fingerprint}
        </Text>
      </Box>
      <Pressable
        backgroundColor={`${colorMode}.OffWhite`}
        style={styles.iconContainer}
        onPress={() => {
          Clipboard.setString(fingerprint);
          showToast(walletTranslation.walletIdCopied, <TickIcon />);
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
    borderRadius: 10,
    height: 60,
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
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: '95%',
  },
  textContainer: {
    margin: 10,
  },
});

export default WalletFingerprint;
