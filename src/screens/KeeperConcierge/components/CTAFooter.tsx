import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import PaperPlaneLight from 'src/assets/images/paper-plane-light.svg';
import PaperPlaneDark from 'src/assets/images/paper-plane-dark.svg';
import PaperClipLight from 'src/assets/images/paper-clip-light.svg';
import PaperClipDark from 'src/assets/images/paper-clip-dark.svg';
import DocumentLight from 'src/assets/images/document-light.svg';
import DocumentDark from 'src/assets/images/document-dark.svg';
import { launchImageLibrary } from 'react-native-image-picker';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const CTAFooter = ({ onAttachScreenshot, addAttributes, onNext }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { translations } = useContext(LocalizationContext);
  const { concierge } = translations;

  const handleAttachScreenshot = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.assets && response.assets.length > 0) {
        onAttachScreenshot(response.assets[0].uri);
      }
    });
  };

  return (
    <Box style={styles.ctaWrapper} backgroundColor={`${colorMode}.ctaFooterBackground`}>
      <Box>
        <Pressable style={[styles.touchable]} onPress={handleAttachScreenshot}>
          {isDarkMode ? <PaperClipDark /> : <PaperClipLight />}
          <Text color={`${colorMode}.buttonText`} fontSize={12}>
            {concierge.attachScreenshot}
          </Text>
        </Pressable>
      </Box>

      <Box style={styles.separator} />
      <Box>
        <Pressable style={[styles.touchable]} onPress={addAttributes}>
          {isDarkMode ? <DocumentDark /> : <DocumentLight />}
          <Text color={`${colorMode}.buttonText`} fontSize={12}>
            {concierge.shareAppAttributes}
          </Text>
        </Pressable>
      </Box>

      <Box>
        <Pressable style={[styles.touchable]} onPress={onNext}>
          {isDarkMode ? <PaperPlaneDark /> : <PaperPlaneLight />}
        </Pressable>
      </Box>
    </Box>
  );
};

export default CTAFooter;

const styles = StyleSheet.create({
  ctaWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: hp(52),
    justifyContent: 'center',
    paddingLeft: wp(20),
    paddingRight: wp(15),
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    gap: wp(10),
    paddingHorizontal: wp(10),
  },
  separator: {
    alignSelf: 'center',
    width: 1,
    height: '60%',
    backgroundColor: '#979797',
    marginLeft: wp(8),
    marginRight: wp(5),
  },
});
