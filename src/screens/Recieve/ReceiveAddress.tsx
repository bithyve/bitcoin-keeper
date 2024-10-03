import React, { useContext } from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import CopyIcon from 'src/assets/images/copy.svg';
import { Share, StyleSheet } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { captureError } from 'src/services/sentry';

type Props = {
  address: string;
};

function ReceiveAddress({ address }: Props) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;

  const shareAddress = async () => {
    try {
      await Share.share({ message: address });
    } catch (error) {
      captureError(error);
    }
  };

  return (
    <Pressable
      onPress={() => {
        Clipboard.setString(address);
        showToast(walletTranslation.addressCopied, <TickIcon />);
      }}
      backgroundColor={`${colorMode}.seashellWhite`}
      style={styles.container}
      borderColor={`${colorMode}.greyBorder`}
    >
      <Box style={styles.textContainer}>
        <Text color={`${colorMode}.secondaryText`} style={styles.value}>
          {address}
        </Text>
      </Box>
      <Pressable
        testID={`btn_copyToClipboard${address}`}
        backgroundColor={`${colorMode}.whiteText`}
        style={styles.iconContainer}
        onPress={shareAddress}
      >
        <CopyIcon />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: hp(20),
    paddingVertical: hp(11),
    paddingHorizontal: wp(8),
  },
  value: {
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.39,
  },
  iconContainer: {
    borderRadius: 10,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(42),
    height: hp(42),
  },
  textContainer: {
    width: '80%',
    paddingHorizontal: 10,
  },
});

export default ReceiveAddress;
