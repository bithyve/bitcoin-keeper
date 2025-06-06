import React, { useContext } from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { hp, wp } from 'src/constants/responsive';
import Text from './KeeperText';
import ThemedSvg from './ThemedSvg.tsx/ThemedSvg';
import ThemedColor from './ThemedColor/ThemedColor';

type Props = {
  data: string;
  title?: string;
  copy?: Function;
  dataType?: 'fingerprint' | 'psbt' | 'xpub' | '2fa';
  width?: number | string;
  height?: number | string;
};

function WalletCopiableData({ title, data, dataType, copy, width = '90%', height = 55 }: Props) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { showToast } = useToastMessage();
  const copyToClipboard = ThemedColor({ name: 'copyToClipboard' });

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;

  return (
    <Box
      backgroundColor={`${colorMode}.textInputBackground`}
      borderColor={isDarkMode ? `${colorMode}.dullGreyBorder` : `${colorMode}.greyBorder`}
      style={styles.container}
      width={width}
      height={height}
    >
      <Box style={styles.textContainer}>
        {title && (
          <Text color={`${colorMode}.black`} style={styles.heading}>
            {title}
          </Text>
        )}
        <Text color={`${colorMode}.GreyText`} numberOfLines={1} style={styles.value}>
          {data}
        </Text>
      </Box>
      <Pressable
        testID={`btn_copyToClipboard${data}`}
        backgroundColor={copyToClipboard}
        style={styles.iconContainer}
        onPress={() => {
          Clipboard.setString(data);
          let msg = '';
          switch (dataType) {
            case 'psbt':
              msg = walletTranslation.psbtCopied;
              break;
            case 'xpub':
              msg = walletTranslation.xpubCopied;
              break;
            case '2fa':
              msg = walletTranslation['2faCopied'];
              break;
            default:
              msg = walletTranslation.walletIdCopied;
          }
          copy ? copy() : showToast(msg, <TickIcon />);
        }}
      >
        <ThemedSvg name={'copy_icon'} />
      </Pressable>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
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
    flex: 1,
  },
});

export default WalletCopiableData;
