import React from 'react';
import { Box, Image, Pressable, useColorMode } from 'native-base';
import { wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';
import BinLight from 'src/assets/images/bin-light.svg';
import BinDark from 'src/assets/images/bin-dark.svg';

const ImagePreview = ({ imageUri, onRemoveImage, index }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  return (
    <Box style={styles.container}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        alt={`conciergeImage-${index}-${imageUri}`}
      />
      <Pressable onPress={() => onRemoveImage(index)} style={styles.deleteButton}>
        <Box style={styles.deleteButton} backgroundColor={`${colorMode}.primaryGreenBackground`}>
          {isDarkMode ? <BinDark /> : <BinLight />}
        </Box>
      </Pressable>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: wp(78),
    height: wp(79),
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: wp(24),
    height: wp(24),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
});

export default ImagePreview;
