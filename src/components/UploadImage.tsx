import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';

import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';

import ImageIcon from 'src/assets/images/image.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

type Props = {
  onPress: () => void;
};

function UploadImage({ onPress = () => {} }: Props) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { importWallet } = translations;
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      testID="btn_upload_image"
      onPress={onPress}
      style={{
        alignItems: 'center',
      }}
    >
      <Box
        backgroundColor={`${colorMode}.brownColor`}
        borderColor={`${colorMode}.brownColor`}
        style={styles.container}
      >
        <ImageIcon />
        <Text medium style={styles.text} color={`${colorMode}.primaryBackground`}>
          {importWallet.uploadFromGallery}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    borderRadius: 5,
    borderWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    letterSpacing: 0.24,
    fontSize: 12,
    marginLeft: 5,
  },
});

export default UploadImage;
