import { StyleSheet } from 'react-native';
import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import KeeperNameIcon from 'src/assets/images/keeper-name-icon.svg';
import KeeperNameIconDark from 'src/assets/privateImages/bitcoinKeeperWhiteLogo.svg';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ThemedSvg from './ThemedSvg.tsx/ThemedSvg';
import ThemedColor from './ThemedColor/ThemedColor';

type MessagePreviewProps = {
  title: string;
  description: string;
  link: string;
};

function MessagePreview({ title, description, link }: MessagePreviewProps) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const msg_preview_background = ThemedColor({ name: 'msg_preview_background' });
  const msg_preview_border = ThemedColor({ name: 'msg_preview_border' });
  const msg_linkContainer_background = ThemedColor({ name: 'msg_linkContainer_background' });
  return (
    <Box
      style={styles.messagePreviewContainer}
      backgroundColor={msg_preview_background}
      borderWidth={1}
      borderColor={msg_preview_border}
    >
      <Text style={styles.previewLabel}>{common.messagePreview}</Text>
      <Box style={styles.previewBox} borderColor={`${colorMode}.greyBorder`}>
        <Text style={styles.messagePreviewTitle}>{title}</Text>
        <Text style={styles.messagePreviewDescription}>{description}</Text>
        <Box style={styles.linkContainer} backgroundColor={msg_linkContainer_background}>
          <Box style={styles.linkIconContainer}>
            <ThemedSvg name={'keeper_icon'} />
          </Box>
          <Box>
            {colorMode === 'light' ? <KeeperNameIcon /> : <KeeperNameIconDark />}
            <Text style={styles.link}>{link}</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default MessagePreview;

const styles = StyleSheet.create({
  messagePreviewContainer: {
    width: '100%',
    borderRadius: 20,
    paddingHorizontal: wp(15),
    paddingVertical: hp(10),
  },
  previewLabel: {
    marginLeft: wp(12),
    marginTop: hp(10),
    fontSize: 14,
    marginBottom: 10,
  },
  previewBox: {
    padding: 15,
    borderRadius: 7,
    alignItems: 'flex-start',
    marginHorizontal: wp(12),
    marginTop: hp(10),
    marginBottom: hp(15),
    paddingLeft: wp(20),
    paddingRight: wp(22),
    paddingTop: hp(21),
    paddingBottom: hp(10),
    borderWidth: 1,
  },
  messagePreviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: hp(5),
  },
  messagePreviewDescription: {
    width: '95%',
    fontSize: 12,
    marginBottom: 10,
  },
  linkContainer: {
    width: '100%',
    height: hp(57),
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(5),
  },
  linkIconContainer: {
    marginLeft: wp(5),
    marginRight: wp(8),
    borderRadius: 5,
    padding: 5,
  },
  link: {
    fontSize: 10,
    textDecorationLine: 'underline',
  },

  tierContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 2,
    paddingBottom: hp(10),
  },
});
