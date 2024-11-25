import React, { useContext } from 'react';
import { Box, useColorMode } from 'native-base';

import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';

import ImageIcon from 'src/assets/images/image.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

type Props = {
  onPress: () => void;
  backgroundColor?: string;
};

function UploadImage({ onPress = () => {}, backgroundColor }: Props) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { importWallet } = translations;

  const bgColor = backgroundColor || `${colorMode}.primaryGreenBackground`;

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      testID="btn_upload_image"
      onPress={onPress}
      style={{
        alignItems: 'center',
      }}
    >
      <Box backgroundColor={bgColor} style={styles.container}>
        <ImageIcon />
        <Text style={styles.text} color="white">
          {importWallet.uploadFromGallery}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    marginLeft: 5,
  },
});

export default UploadImage;
